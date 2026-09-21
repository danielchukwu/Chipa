package router

import (
	"errors"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
	httpSwagger "github.com/swaggo/http-swagger"

	_ "chipa/api/docs"
	"chipa/api/internal/config"
	"chipa/api/internal/db/queries"
	"chipa/api/internal/handler"
	"chipa/api/internal/logger"
	apimiddleware "chipa/api/internal/middleware"
	bridgeprovider "chipa/api/internal/provider/bridge"
	cardprovider "chipa/api/internal/provider/card"
	paystackprovider "chipa/api/internal/provider/paystack"
	vasprovider "chipa/api/internal/provider/vas"
	"chipa/api/internal/service/audit"
	authservice "chipa/api/internal/service/auth"
	filesservice "chipa/api/internal/service/files"
	fintechservice "chipa/api/internal/service/fintech"
	messagingservice "chipa/api/internal/service/messaging"
	permissionsservice "chipa/api/internal/service/permissions"
	r2service "chipa/api/internal/service/r2"
	referralsservice "chipa/api/internal/service/referrals"
	statesservice "chipa/api/internal/service/states"
	usersservice "chipa/api/internal/service/users"
	"chipa/api/internal/utils"
	"chipa/api/internal/worker"

	authhandler "chipa/api/internal/handler/auth"
	cardshandler "chipa/api/internal/handler/cards"
	fileshandler "chipa/api/internal/handler/files"
	fxhandler "chipa/api/internal/handler/fx"
	kychandler "chipa/api/internal/handler/kyc"
	pinhandler "chipa/api/internal/handler/pin"
	referralshandler "chipa/api/internal/handler/referrals"
	stateshandler "chipa/api/internal/handler/states"
	systemsettingshandler "chipa/api/internal/handler/system_settings"
	usershandler "chipa/api/internal/handler/users"
	vashandler "chipa/api/internal/handler/vas"
	walletshandler "chipa/api/internal/handler/wallets"
	webhookshandler "chipa/api/internal/handler/webhooks"
)

// New creates and returns a configured Chi router for Chipa.
func New(cfg *config.Config, pool *pgxpool.Pool, rdb *redis.Client, distributor worker.TaskDistributor) http.Handler {
	mainRouter := chi.NewRouter()

	// Initialize database queries & services
	q := queries.New(pool)
	messagingService, err := messagingservice.NewMessagingService()
	if err != nil {
		slog.Error("failed to initialize messaging service", "err", err)
	}

	var jwtSecret string
	var accessExp, refreshExp time.Duration
	if cfg != nil {
		jwtSecret = cfg.JWTSecret
		accessExp = cfg.JWTAccessExpiration
		refreshExp = cfg.JWTRefreshExpiration
	}

	var bridgeAPIKey, bridgeBaseURL string
	var paystackSecretKey, paystackPublicKey, paystackBaseURL string
	if cfg != nil {
		bridgeAPIKey = cfg.Bridge.APIKey
		bridgeBaseURL = cfg.Bridge.BaseURL
		paystackSecretKey = cfg.Paystack.SecretKey
		paystackPublicKey = cfg.Paystack.PublicKey
		paystackBaseURL = cfg.Paystack.BaseURL
	}

	// BaaS & Payment Rails (Bridge.xyz for USD/EUR/GBP/USDC, Paystack for NGN)
	bridgeClient := bridgeprovider.NewBridgeClient(bridgeAPIKey, bridgeBaseURL)
	paystackClient := paystackprovider.NewPaystackClient(paystackSecretKey, paystackPublicKey, paystackBaseURL)
	sandboxCardProvider := cardprovider.NewSandboxCardProvider()
	sandboxVASProvider := vasprovider.NewSandboxVASProvider()

	// Core Fintech Services
	ledgerSvc := fintechservice.NewLedgerService(pool)
	walletSvc := fintechservice.NewWalletService(pool, bridgeClient, paystackClient, ledgerSvc)
	cardSvc := fintechservice.NewCardService(pool, sandboxCardProvider, walletSvc, ledgerSvc)
	fxSvc := fintechservice.NewFXService(walletSvc)
	vasSvc := fintechservice.NewVASService(sandboxVASProvider, walletSvc)
	pinSvc := fintechservice.NewPINService(pool)
	kycSvc := fintechservice.NewKYCService(pool, paystackClient)

	utilsInstance := utils.NewUtils(pool)
	auditService := audit.NewAuditService(q)
	statesService := statesservice.NewStatesService(q, rdb)
	permissionsService := permissionsservice.NewPermissionsService()
	referralsService := referralsservice.NewReferralsService(q)
	usersService := usersservice.NewUsersService(q, rdb, paystackClient)
	authService := authservice.NewAuthService(pool, q, rdb, messagingService, usersService, jwtSecret, accessExp, refreshExp)
	filesService := filesservice.NewFilesService(q)

	// Initialize R2 service
	var r2Svc *r2service.R2Service
	var r2Err error
	if cfg != nil {
		r2Svc, r2Err = r2service.New(r2service.Config{
			AccountID:       cfg.R2.AccountID,
			AccessKeyID:     cfg.R2.AccessKeyID,
			SecretAccessKey: cfg.R2.SecretAccessKey,
			BucketName:      cfg.R2.BucketName,
			PublicURL:       cfg.R2.PublicURL,
			ZoneID:          cfg.R2.ZoneID,
			APIToken:        cfg.R2.APIToken,
		})
	} else {
		r2Err = errors.New("no config provided")
	}
	if r2Err != nil {
		slog.Warn("R2 service not configured", "reason", r2Err)
	}

	// Handlers
	authH := authhandler.NewHandler(authService, usersService, filesService, utilsInstance)
	usersH := usershandler.NewHandler(usersService, auditService, permissionsService, utilsInstance)
	referralsH := referralshandler.NewHandler(referralsService, utilsInstance)
	statesH := stateshandler.NewHandler(statesService, utilsInstance)
	systemSettingsH := systemsettingshandler.NewHandler(q, utilsInstance)
	webhooksH := webhookshandler.NewHandler(walletSvc, paystackClient, utilsInstance)

	var filesH *fileshandler.Handler
	if r2Svc != nil {
		filesH = fileshandler.NewHandler(q, r2Svc, rdb, utilsInstance, usersService, auditService)
	}

	walletsH := walletshandler.NewHandler(walletSvc, utilsInstance)
	cardsH := cardshandler.NewHandler(cardSvc, pinSvc, utilsInstance)
	fxH := fxhandler.NewHandler(fxSvc, pinSvc, utilsInstance)
	vasH := vashandler.NewHandler(vasSvc, pinSvc, utilsInstance)
	pinH := pinhandler.NewHandler(pinSvc, utilsInstance)
	kycH := kychandler.NewHandler(kycSvc, utilsInstance)

	// Middlewares
	mainRouter.Use(securityHeadersMiddleware)
	mainRouter.Use(corsMiddleware)
	mainRouter.Use(middleware.RequestID)
	mainRouter.Use(middleware.RealIP)
	mainRouter.Use(requestLoggerMiddleware)
	mainRouter.Use(apimiddleware.PrometheusMiddleware)
	mainRouter.Use(middleware.Recoverer)

	// Swagger documentation (Dev only)
	if os.Getenv("ENV") != "production" {
		mainRouter.Get("/api/v1/swagger/*", httpSwagger.Handler(
			httpSwagger.URL("/api/v1/swagger/doc.json"),
		))
	}

	// Base endpoints
	mainRouter.Get(utils.ApiUrls.Root, handler.Root)
	mainRouter.Get(utils.ApiUrls.Health, handler.Health)
	mainRouter.Get("/metrics", promhttp.Handler().ServeHTTP)

	// Public Auth routes
	mainRouter.Post("/api/v1/auth/signup", authH.Signup)
	mainRouter.Post(utils.ApiUrls.Auth.SendSignupEmailOTP, authH.SendSignupEmailOTP)
	mainRouter.Post(utils.ApiUrls.Auth.VerifySignupEmailOTP, authH.VerifySignupEmailOTP)
	mainRouter.Post("/api/v1/auth/forgot-password/email-otp", authH.SendForgotPasswordEmailOTP)
	mainRouter.Post(utils.ApiUrls.Auth.CheckNin, authH.CheckNin)
	mainRouter.Post(utils.ApiUrls.Auth.CheckUsername, authH.CheckUsername)
	mainRouter.Post(utils.ApiUrls.Auth.CheckReferralCode, authH.CheckReferralCode)
	mainRouter.Post(utils.ApiUrls.Auth.Login, authH.LoginCredentials)
	mainRouter.Post("/api/v1/auth/login/pin", authH.LoginPin)
	mainRouter.Post(utils.ApiUrls.Auth.Logout, authH.Logout)
	mainRouter.Post(utils.ApiUrls.Auth.Refresh, authH.Refresh)
	mainRouter.Post(utils.ApiUrls.Auth.ChangePasswordByEmail, authH.ChangePasswordByEmail)

	// Paystack Webhook
	mainRouter.Post("/api/v1/webhooks/paystack", webhooksH.HandlePaystack)

	// Banks & States
	mainRouter.Get("/api/v1/banks", usersH.GetBanks)
	mainRouter.Get("/api/v1/banks/validate", usersH.ValidateBankAccount)
	mainRouter.Get("/api/v1/states/{id}", statesH.GetState)

	// FX Live Rates (Public)
	mainRouter.Get("/api/v1/fx/rates", fxH.GetRates)

	// VAS Categories & Operators (Public)
	mainRouter.Get("/api/v1/bills/categories", vasH.GetCategories)
	mainRouter.Get("/api/v1/bills/operators", vasH.GetOperators)

	// Authenticated Routes
	authMiddleware := apimiddleware.AuthMiddleware(jwtSecret)

	// Users & Security
	mainRouter.With(authMiddleware).Get("/api/v1/users/me", usersH.GetMe)
	mainRouter.With(authMiddleware).Patch("/api/v1/users/me", usersH.UpdateProfile)
	mainRouter.With(authMiddleware).Patch("/api/v1/users/me/onboarding", authH.SaveOnboardingProfile)
	mainRouter.With(authMiddleware).Post("/api/v1/users/phone/otp", authH.SendPhoneOTP)
	mainRouter.With(authMiddleware).Post("/api/v1/users/phone/verify", authH.VerifyPhoneOTP)
	mainRouter.With(authMiddleware).Post("/api/v1/users/pin/set", pinH.SetPIN)
	mainRouter.With(authMiddleware).Post("/api/v1/users/pin/verify", pinH.VerifyPIN)

	// Multi-Currency Wallets (NGN, USD, GBP, EUR) & Double-Entry Ledger
	mainRouter.With(authMiddleware).Get("/api/v1/wallets", walletsH.GetWallets)
	mainRouter.With(authMiddleware).Get("/api/v1/wallets/{currency}", walletsH.GetWalletByCurrency)
	mainRouter.With(authMiddleware).Get("/api/v1/wallets/ledger/transactions", walletsH.GetLedgerTransactions)

	// Progressive KYC Compliance Tiers (0-3) & AML Screening
	mainRouter.With(authMiddleware).Get("/api/v1/kyc/status", kycH.GetKYCStatus)
	mainRouter.With(authMiddleware).Post("/api/v1/kyc/tier1", kycH.SubmitTier1)
	mainRouter.With(authMiddleware).Post("/api/v1/kyc/tier2", kycH.SubmitTier2)
	mainRouter.With(authMiddleware).Post("/api/v1/kyc/tier3", kycH.SubmitTier3)
	mainRouter.With(authMiddleware).Post("/api/v1/kyc/compliance-screening", kycH.UpdateComplianceScreening)

	// Virtual & Physical Cards (Visa & Mastercard)
	mainRouter.With(authMiddleware).Get("/api/v1/cards", cardsH.ListCards)
	mainRouter.With(authMiddleware).Post("/api/v1/cards", cardsH.CreateCard)
	mainRouter.With(authMiddleware).Post("/api/v1/cards/{id}/freeze", cardsH.FreezeCard)
	mainRouter.With(authMiddleware).Post("/api/v1/cards/{id}/unfreeze", cardsH.UnfreezeCard)
	mainRouter.With(authMiddleware).Post("/api/v1/cards/{id}/fund", cardsH.FundCard)
	mainRouter.With(authMiddleware).Get("/api/v1/cards/{id}/details", cardsH.GetCardDetails)

	// FX Conversion Engine (Quotes & Swaps)
	mainRouter.With(authMiddleware).Post("/api/v1/fx/quote", fxH.CreateQuote)
	mainRouter.With(authMiddleware).Post("/api/v1/fx/swap", fxH.ExecuteSwap)

	// VAS / Bill Payments
	mainRouter.With(authMiddleware).Post("/api/v1/bills/validate", vasH.ValidateRecipient)
	mainRouter.With(authMiddleware).Post("/api/v1/bills/pay", vasH.PayBill)

	// Files
	if filesH != nil {
		mainRouter.With(authMiddleware).Post("/api/v1/files/presigned-url", filesH.GenerateUploadURL)
		mainRouter.With(authMiddleware).Post("/api/v1/files/confirm", filesH.ConfirmUpload)
		mainRouter.With(authMiddleware).Get("/api/v1/files/{id}", filesH.GetFile)
	}

	// Referrals
	mainRouter.With(authMiddleware).Get("/api/v1/referrals/my-code", referralsH.ListMyReferrals)
	mainRouter.With(authMiddleware).Get("/api/v1/referrals/stats", referralsH.GetReferralStats)
	mainRouter.With(authMiddleware).Get("/api/v1/referrals/referred-users", referralsH.ListReferredUsers)

	// Settings
	mainRouter.With(authMiddleware).Get("/api/v1/settings", systemSettingsH.GetSystemSetting)

	return mainRouter
}

// corsMiddleware handles Cross-Origin Resource Sharing with credentials support
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set(
			"Access-Control-Allow-Methods",
			strings.Join([]string{http.MethodOptions, http.MethodPost, http.MethodGet, http.MethodPut, http.MethodPatch, http.MethodDelete}, ", "),
		)
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Cookie")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// requestLoggerMiddleware injects a request-scoped logger into the context
func requestLoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := middleware.GetReqID(r.Context())
		if reqID == "" {
			reqID = "unknown"
		}

		log := slog.Default().With("request_id", reqID, "component", logger.ComponentRouter)
		ctx := logger.WithContext(r.Context(), log)
		ctx = audit.WithRequestMetadata(ctx, r.RemoteAddr, r.UserAgent())
		r = r.WithContext(ctx)

		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		start := time.Now()

		defer func() {
			log.Info(logger.EventHTTPRequest,
				"method", r.Method,
				"path", r.URL.Path,
				"status", ww.Status(),
				"duration", time.Since(start).String(),
				"ip", r.RemoteAddr,
			)
		}()

		next.ServeHTTP(ww, r)
	})
}

// securityHeadersMiddleware enforces bank-grade HTTP security headers for PCI-DSS & OWASP compliance
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "0")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("X-Permitted-Cross-Domain-Policies", "none")
		w.Header().Set("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()")

		next.ServeHTTP(w, r)
	})
}
