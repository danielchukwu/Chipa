package authhandler

import (
	"context"
	"encoding/json"
	"chipa/api/internal/db/queries"
	apimiddleware "chipa/api/internal/middleware"
	auth "chipa/api/internal/service/auth"
	"chipa/api/internal/utils"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgtype"
)

type AuthService interface {
	Signup(ctx context.Context, email, phone, password string, countryID int16, emailVerificationToken ...string) (auth.SignupResult, error)
	SendSignupEmailOTP(ctx context.Context, email string) (auth.EmailOTPResult, error)
	VerifySignupEmailOTP(ctx context.Context, email, otp string) (auth.EmailOTPResult, error)
	SendForgotPasswordEmailOTP(ctx context.Context, email string) (auth.EmailOTPResult, error)
	SendPhoneOTP(ctx context.Context, userID int64, phone, channel, iso2 string) error
	VerifyPhoneOTP(ctx context.Context, userID int64, phone, otp, iso2 string) error
	UpdateOnboardingProfile(ctx context.Context, userID int64, params auth.OnboardingProfileParams) error
	CompleteOnboarding(ctx context.Context, userID int64, publicID string, params queries.UpdateOnboardingProfileParams, referrerUserID *int64, nin string) error
	CheckNIN(ctx context.Context, nin string) bool
	CheckUsername(ctx context.Context, username string) bool
	CheckReferralCode(ctx context.Context, code string) (bool, string, int64)
	Login(ctx context.Context, identifierType, identifier, password, iso2 string, allowedRoles ...string) (auth.LoginResult, error)
	LoginCredentials(ctx context.Context, identifier, password, identifierType, iso2 string) (auth.LoginCredentialsResult, error)
	LoginPin(ctx context.Context, preAuthToken, pin string) (auth.LoginResult, error)
	Refresh(ctx context.Context, refreshToken string) (auth.RefreshResult, error)
	Logout(ctx context.Context, refreshToken string) error
	GetCountryIDByIso2(ctx context.Context, iso2 string) (int16, error)
	ChangePasswordByEmail(ctx context.Context, email, otp, newPassword string) error
	GetUserDetailsByFakeID(ctx context.Context, fakeID string) (queries.UserWithPlaces, error)
}

// UsersService interface defines the methods from UsersService that the auth handler needs
type UsersService interface {
	CheckNIN(ctx context.Context, nin string) bool
	CheckUsername(ctx context.Context, username string) (bool, string)
	CheckEmail(ctx context.Context, email string) (bool, string)
	GenerateUniqueReferralCode(ctx context.Context, firstName string) (string, error)
}

// FilesService interface defines the methods from FilesService that the auth handler needs
type FilesService interface {
	UpdateFileOwner(ctx context.Context, fileID int64, ownerID int64) (queries.File, error)
}

// Handler struct holds the dependencies for the auth handler
type Handler struct {
	authService  AuthService
	usersService UsersService
	filesService FilesService
	validate     *validator.Validate
	utils        *utils.Utils
}

// NewHandler creates a new instance of the auth handler
func NewHandler(authService AuthService, usersService UsersService, filesService FilesService, utils *utils.Utils) *Handler {
	return &Handler{
		authService:  authService,
		usersService: usersService,
		filesService: filesService,
		validate:     validator.New(),
		utils:        utils,
	}
}

// SignupRequest represents the structure for Phase 1 basic sign-up
type SignupRequest struct {
	CountryID        int16  `json:"countryId" validate:"required" example:"161"`
	Email            string `json:"email" validate:"required,email" example:"user@example.com"`
	Password         string `json:"password" validate:"required,min=5,max=72" example:"SecurePassword123!"`
	VerificationCode string `json:"verificationCode" validate:"required" example:"123456"`
}

// UnmarshalJSON provides seamless backward-compatibility for snake_case (country_id, verification_code)
// and token aliases without exposing redundant fields in the public Swagger/OpenAPI documentation.
func (r *SignupRequest) UnmarshalJSON(data []byte) error {
	type Alias SignupRequest
	aux := struct {
		*Alias
		CountryIDSnake          *int16  `json:"country_id"`
		CountryCode             *string `json:"countryCode"`
		CountryCodeSnake        *string `json:"country_code"`
		VerificationCodeSnake   *string `json:"verification_code"`
		EmailVerificationToken  *string `json:"emailVerificationToken"`
		EmailVerificationTokenS *string `json:"email_verification_token"`
		EmailVerificationCode   *string `json:"emailVerificationCode"`
		EmailVerificationCodeS  *string `json:"email_verification_code"`
		OTP                     *string `json:"otp"`
		Code                    *string `json:"code"`
	}{
		Alias: (*Alias)(r),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	if r.CountryID <= 0 && aux.CountryIDSnake != nil && *aux.CountryIDSnake > 0 {
		r.CountryID = *aux.CountryIDSnake
	}
	if r.VerificationCode == "" {
		if aux.VerificationCodeSnake != nil && *aux.VerificationCodeSnake != "" {
			r.VerificationCode = *aux.VerificationCodeSnake
		} else if aux.EmailVerificationToken != nil && *aux.EmailVerificationToken != "" {
			r.VerificationCode = *aux.EmailVerificationToken
		} else if aux.EmailVerificationTokenS != nil && *aux.EmailVerificationTokenS != "" {
			r.VerificationCode = *aux.EmailVerificationTokenS
		} else if aux.EmailVerificationCode != nil && *aux.EmailVerificationCode != "" {
			r.VerificationCode = *aux.EmailVerificationCode
		} else if aux.EmailVerificationCodeS != nil && *aux.EmailVerificationCodeS != "" {
			r.VerificationCode = *aux.EmailVerificationCodeS
		} else if aux.OTP != nil && *aux.OTP != "" {
			r.VerificationCode = *aux.OTP
		} else if aux.Code != nil && *aux.Code != "" {
			r.VerificationCode = *aux.Code
		}
	}
	return nil
}

type VerifySignupEmailOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp" validate:"required,len=6,numeric"`
}

// Signup godoc
// @Summary Basic sign-up (Phase 1)
// @Description Handles initial registration with country ID, email, password, and verification code
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body SignupRequest true "Basic sign-up details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/signup [post]
func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest

	// Parse the incoming JSON payload into the request struct
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	// Validate required fields (countryId, email, password, verificationCode)
	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	countryID := req.CountryID
	if countryID <= 0 {
		countryID = 161 // default to Nigeria in c_countries
	}

	// Delegate business logic to create the user and generate authentication tokens
	result, err := h.authService.Signup(r.Context(), req.Email, "", req.Password, countryID, req.VerificationCode)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Respond with success, including the user's ID, user object, and authentication tokens
	h.utils.RespondSuccess(w, http.StatusOK, "Sign-up successful", map[string]interface{}{
		"id":           result.ID,
		"accessToken":  result.AccessToken,
		"refreshToken": result.RefreshToken,
		"user":         result.User,
	})
}

type SendSignupEmailOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// SendSignupEmailOTP godoc
// @Summary Send signup email OTP
// @Description Sends a 6-digit verification OTP to a new user's email during registration
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body SendSignupEmailOTPRequest true "Email OTP request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/signup/email-otp [post]
func (h *Handler) SendSignupEmailOTP(w http.ResponseWriter, r *http.Request) {
	var req SendSignupEmailOTPRequest

	// Parse the incoming JSON payload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	// Validate required fields in the request
	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	// Delegate business logic to the auth service
	result, err := h.authService.SendSignupEmailOTP(r.Context(), req.Email)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Respond with success and the email verification token details
	h.utils.RespondSuccess(w, http.StatusOK, result.Message, map[string]interface{}{
		"message":                result.Message,
		"emailVerificationToken": result.EmailVerificationToken,
		"expiresInSeconds":       result.ExpiresInSeconds,
	})
}

// VerifySignupEmailOTP godoc
// @Summary Verify signup email OTP
// @Description Verifies the OTP sent to a new user's email during registration
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body VerifySignupEmailOTPRequest true "Verify email OTP request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/signup/email-otp/verify [post]
func (h *Handler) VerifySignupEmailOTP(w http.ResponseWriter, r *http.Request) {
	var req VerifySignupEmailOTPRequest

	// Parse the incoming JSON payload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	// Validate required fields (email and OTP)
	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	// Delegate business logic to verify the OTP
	result, err := h.authService.VerifySignupEmailOTP(r.Context(), req.Email, req.OTP)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Respond with success and the email verification token details
	h.utils.RespondSuccess(w, http.StatusOK, result.Message, map[string]interface{}{
		"message":                result.Message,
		"emailVerificationToken": result.EmailVerificationToken,
		"expiresInSeconds":       result.ExpiresInSeconds,
	})
}

// SendForgotPasswordEmailOTP godoc
// @Summary Send forgot password email OTP
// @Description Sends an OTP for password recovery
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body SendSignupEmailOTPRequest true "Email OTP request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/forgot-password/email-otp [post]
func (h *Handler) SendForgotPasswordEmailOTP(w http.ResponseWriter, r *http.Request) {
	var req SendSignupEmailOTPRequest

	// Parse the incoming JSON payload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	// Validate required fields in the request
	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	// Delegate business logic to generate and send the OTP
	result, err := h.authService.SendForgotPasswordEmailOTP(r.Context(), req.Email)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Respond with success and OTP expiration details
	h.utils.RespondSuccess(w, http.StatusOK, result.Message, map[string]interface{}{
		"message":          result.Message,
		"expiresInSeconds": result.ExpiresInSeconds,
	})
}

type CompleteOnboardingRequest struct {
	// details step
	FirstName       string `json:"first_name" validate:"required,min=2,max=30"`
	LastName        string `json:"last_name" validate:"required,min=2,max=30"`
	MiddleName      string `json:"middle_name" validate:"omitempty,max=30"`
	Gender          string `json:"gender" validate:"required,oneof=male female"`
	DateOfBirth     string `json:"date_of_birth" validate:"required"`
	ReferrerUserId  *int64 `json:"referrer_user_id" validate:"omitempty"`
	ReferralCode    string `json:"referral_code" validate:"omitempty"`
	Nin             string `json:"nin" validate:"required,len=11"`
	Username        string `json:"username" validate:"required,min=2,max=30"`
	CountryOfOrigin int16  `json:"country_of_origin" validate:"omitempty"`
	StateOfOrigin   int16  `json:"state_of_origin" validate:"omitempty"`
	CurrentCountry  int16  `json:"current_country" validate:"required"`
	CurrentState    int16  `json:"current_state" validate:"required"`
	CurrentCity     int32  `json:"current_city" validate:"omitempty"`
}

// CompleteOnboarding handles PATCH /api/v1/auth/onboarding
func (h *Handler) CompleteOnboarding(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Extract JWT claims from the context
	claims, ok := ctx.Value(apimiddleware.ClaimsKey).(*utils.JWTClaims)
	if !ok || claims == nil {
		h.utils.RespondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Decode the incoming request body
	var req CompleteOnboardingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	// Validate the request payload
	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	// Check NIN if provided
	if h.usersService.CheckNIN(ctx, req.Nin) {
		h.utils.RespondError(w, http.StatusBadRequest, "NIN is already taken")
		return
	}

	// Validate referral code and referrer user id if both are provided
	if len(req.ReferralCode) > 0 && req.ReferrerUserId != nil && *req.ReferrerUserId > 0 {
		valid, _, refId := h.authService.CheckReferralCode(ctx, req.ReferralCode)
		if !valid || refId != *req.ReferrerUserId {
			h.utils.RespondError(w, http.StatusBadRequest, "Invalid referral code or referrer")
			return
		}
	}

	// Clean and validate username format
	cleanUsername, err := auth.CleanUsername(req.Username)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Check username availability
	if exists, _ := h.usersService.CheckUsername(ctx, cleanUsername); exists {
		h.utils.RespondError(w, http.StatusBadRequest, "Username is already taken")
		return
	}

	// Fetch the DB user
	user, err := h.authService.GetUserDetailsByFakeID(ctx, claims.PublicID)
	if err != nil {
		h.utils.RespondError(w, http.StatusNotFound, "User not found")
		return
	}

	// if account_status != "just_registered", return error
	if user.AccountStatus.String != "just_registered" {
		h.utils.RespondError(w, http.StatusBadRequest, "User is already onboarded")
		return
	}

	// Parse date of birth
	dob, err := time.Parse("2006-01-02", req.DateOfBirth)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid date_of_birth format, expected YYYY-MM-DD")
		return
	}

	// Generate unique referral code (e.g. DANIEL402)
	myReferralCode, err := h.usersService.GenerateUniqueReferralCode(ctx, req.FirstName)
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, "Failed to generate referral code")
		return
	}

	params := queries.UpdateOnboardingProfileParams{
		ID:              user.ID,
		Username:        pgtype.Text{String: cleanUsername, Valid: cleanUsername != ""},
		FirstName:       pgtype.Text{String: req.FirstName, Valid: true},
		LastName:        pgtype.Text{String: req.LastName, Valid: true},
		MiddleName:      pgtype.Text{String: req.MiddleName, Valid: req.MiddleName != ""},
		Gender:          pgtype.Text{String: req.Gender, Valid: true},
		DateOfBirth:     pgtype.Date{Time: dob, Valid: true},
		CurrentCountry:  req.CurrentCountry,
		CurrentState:    req.CurrentState,
		CurrentCity:     pgtype.Int4{Int32: req.CurrentCity, Valid: req.CurrentCity != 0},
		StateOfOrigin:   pgtype.Int2{Int16: req.StateOfOrigin, Valid: req.StateOfOrigin != 0},
		CountryOfOrigin: pgtype.Int2{Int16: req.CountryOfOrigin, Valid: req.CountryOfOrigin != 0},
		ReferralCode:    pgtype.Text{String: myReferralCode, Valid: myReferralCode != ""},
	}

	if err = h.authService.CompleteOnboarding(r.Context(), user.ID, user.PublicID, params, req.ReferrerUserId, req.Nin); err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, "Failed to complete onboarding: "+err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Onboarding completed successfully", nil)
}

// CheckNINRequest represents the structure for checking if a NIN exists
type CheckNINRequest struct {
	Nin string `json:"nin" validate:"required,numeric,len=11"`
}

// CheckNin godoc
// @Summary Check NIN
// @Description Checks if the National Identification Number (NIN) already exists
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body CheckNINRequest true "NIN to check"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/check_nin [post]
// CheckNin checks if the National Identification Number (NIN) already exists
func (h *Handler) CheckNin(w http.ResponseWriter, r *http.Request) {
	var req CheckNINRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	exists := h.usersService.CheckNIN(r.Context(), req.Nin)

	h.utils.RespondSuccess(w, http.StatusOK, "NIN check completed", map[string]interface{}{
		"exists": exists,
	})
}

// CheckUsernameRequest represents the structure for checking if a username exists
type CheckUsernameRequest struct {
	Username string `json:"username" validate:"required,min=2,max=30"`
}

// CheckUsername godoc
// @Summary Check Username
// @Description Checks if the username already exists
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body CheckUsernameRequest true "Username to check"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/check_username [post]
// CheckUsername checks if the username already exists, used during registration
func (h *Handler) CheckUsername(w http.ResponseWriter, r *http.Request) {
	var req CheckUsernameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	// checks if the username is cleaned
	_, err := auth.CleanUsername(req.Username)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// checks if the username exist
	exists, _ := h.usersService.CheckUsername(r.Context(), req.Username)

	h.utils.RespondSuccess(w, http.StatusOK, "Username checked successfully", map[string]interface{}{
		"exists": exists,
	})
}

// CheckReferralCodeRequest represents the structure for checking if a referral code exists
type CheckReferralCodeRequest struct {
	Code string `json:"code" validate:"required,min=5"`
}

// CheckReferralCode godoc
// @Summary Check Referral Code existence
// @Description Check if a given referral code exists
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body CheckReferralCodeRequest true "Referral code to check"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/check_referral_code [post]
func (h *Handler) CheckReferralCode(w http.ResponseWriter, r *http.Request) {
	var req CheckReferralCodeRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	exists, name, referrerId := h.authService.CheckReferralCode(r.Context(), req.Code)

	h.utils.RespondSuccess(w, http.StatusOK, "Referral code checked successfully", map[string]interface{}{
		"exists":     exists,
		"name":       name,
		"referrerId": referrerId,
	})
}

// LoginCredentialsRequest represents Phase 1 of 2-step authentication
type LoginCredentialsRequest struct {
	Identifier     string `json:"identifier" validate:"required,min=2,max=100"`
	Password       string `json:"password" validate:"required,min=4"`
	IdentifierType string `json:"identifierType" validate:"omitempty,oneof=email username phone"`
	Iso2           string `json:"iso2" validate:"omitempty"`
}

// @Summary Login Phase 1 (Credentials)
// @Description Verifies email/identifier and password, returns short-lived pre-auth token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginCredentialsRequest true "User credentials"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/login [post]
func (h *Handler) LoginCredentials(w http.ResponseWriter, r *http.Request) {
	var req LoginCredentialsRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	result, err := h.authService.LoginCredentials(r.Context(), req.Identifier, req.Password, req.IdentifierType, req.Iso2)
	if err != nil {
		h.utils.RespondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Credentials verified", map[string]interface{}{
		"preAuthToken": result.PreAuthToken,
		"requiresPin":  result.RequiresPIN,
		"user":         result.User,
	})
}

// LoginPinRequest represents Phase 2 of 2-step authentication
type LoginPinRequest struct {
	PreAuthToken string `json:"preAuthToken" validate:"required"`
	PIN          string `json:"pin" validate:"required,len=4,numeric"`
}

// @Summary Login Phase 2 (PIN)
// @Description Verifies 4-digit transaction PIN using pre-auth token and issues full session JWTs
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginPinRequest true "PIN and pre-auth token"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/login/pin [post]
func (h *Handler) LoginPin(w http.ResponseWriter, r *http.Request) {
	var req LoginPinRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	result, err := h.authService.LoginPin(r.Context(), req.PreAuthToken, req.PIN)
	if err != nil {
		h.utils.RespondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Login successful", map[string]interface{}{
		"accessToken":  result.AccessToken,
		"refreshToken": result.RefreshToken,
		"user":         result.User,
	})
}

// RefreshRequest represents the refresh token parameters
type RefreshRequest struct {
	RefreshToken string `json:"refreshToken"`
}

// Refresh godoc
// @Summary Refresh Token
// @Description Handles token rotation using a valid refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body RefreshRequest true "Refresh token"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/refresh [post]
// Refresh handles token rotation using a valid refresh token
func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req RefreshRequest

	if r.Body != nil && r.ContentLength > 0 {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
			return
		}
	}

	if req.RefreshToken == "" {
		h.utils.RespondError(w, http.StatusUnauthorized, "Refresh token is missing")
		return
	}

	result, err := h.authService.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		h.utils.RespondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	// return the new accessToken and refreshToken
	h.utils.RespondSuccess(w, http.StatusOK, "Token refreshed successfully", map[string]interface{}{
		"accessToken":  result.AccessToken,
		"refreshToken": result.RefreshToken,
		"user":         result.User,
	})
}

// LogoutRequest represents the parameters for logging out
type LogoutRequest struct {
	RefreshToken string `json:"refreshToken"`
}

// Logout godoc
// @Summary Logout user
// @Description Handles the user logout by removing the session
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LogoutRequest true "Refresh token"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/logout [post]
// Logout handles the user logout by removing the session
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	var req LogoutRequest

	if r.Body != nil && r.ContentLength > 0 {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
			return
		}
	}

	if req.RefreshToken == "" {
		h.utils.RespondError(w, http.StatusBadRequest, "Refresh token is missing")
		return
	}

	err := h.authService.Logout(r.Context(), req.RefreshToken)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Logout successful", nil)
}

// ChangePasswordByEmailRequest represents the structure for resetting password using email
type ChangePasswordByEmailRequest struct {
	Email    string `json:"email" validate:"required,email"`
	OTP      string `json:"otp" validate:"required,len=6"`
	Password string `json:"password" validate:"required,min=5,max=72"`
}

// ChangePasswordByEmail godoc
// @Summary Change password by email
// @Description Resets a user's password using their email address and OTP, invalidating active sessions
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body ChangePasswordByEmailRequest true "Email, OTP and new password details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /auth/change-password [post]
// ChangePasswordByEmail handles resetting the user's password by email
func (h *Handler) ChangePasswordByEmail(w http.ResponseWriter, r *http.Request) {
	var req ChangePasswordByEmailRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	err := h.authService.ChangePasswordByEmail(r.Context(), req.Email, req.OTP, req.Password)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Password changed successfully", nil)
}

// AdminLoginRequest represents the simplified payload for admin login
type AdminLoginRequest struct {
	Identifier     string `json:"identifier" validate:"required,min=2,max=50"`
	Password       string `json:"password" validate:"required,min=4"`
	IdentifierType string `json:"identifierType" validate:"required,oneof=email username phone"`
	Iso2           string `json:"iso2" validate:"omitempty"`
}

// @Summary Login admin user
// @Description Authenticates an admin and returns access and refresh tokens
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body AdminLoginRequest true "Admin login credentials"
// @Success 200 {object} AdminLoginResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/admin/login [post]
func (h *Handler) AdminLogin(w http.ResponseWriter, r *http.Request) {
	var req AdminLoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	result, err := h.authService.Login(r.Context(), req.IdentifierType, req.Identifier, req.Password, req.Iso2, "admin", "super_admin")
	if err != nil {
		h.utils.RespondError(w, http.StatusUnauthorized, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Login successful", map[string]interface{}{
		"accessToken":  result.AccessToken,
		"refreshToken": result.RefreshToken,
		"user":         result.User,
	})
}


// LoginUser represents user details returned on login
type LoginUser struct {
	ID           int64    `json:"id"`
	FakeID       int64    `json:"fake_id"`
	Email        string   `json:"email"`
	Username     string   `json:"username"`
	ReferralCode string   `json:"referral_code"`
	FirstName    string   `json:"first_name"`
	LastName     string   `json:"last_name"`
	MiddleName   string   `json:"middle_name"`
	Gender       string   `json:"gender"`
	DateOfBirth  string   `json:"date_of_birth"`
	Avatar       string   `json:"avatar"`
	Phone        string   `json:"phone"`
	Roles        []string `json:"roles"`
}

// AdminLoginResponse represents the Swagger response structure for admin login
type AdminLoginResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Data    AdminLoginData `json:"data"`
}

// AdminLoginData represents the inner response payload for admin login
type AdminLoginData struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	User         LoginUser `json:"user"`
}

// SendPhoneOTPRequest represents the payload to send phone OTP
type SendPhoneOTPRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required"`
	Channel     string `json:"channel" validate:"required,oneof=sms whatsapp"`
	Iso2        string `json:"iso2" validate:"omitempty"`
}

// @Summary Send Phone OTP
// @Description Sends a 6-digit OTP to the user's phone via SMS or WhatsApp
// @Tags Auth
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body SendPhoneOTPRequest true "Phone OTP request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /users/phone/otp [post]
func (h *Handler) SendPhoneOTP(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req SendPhoneOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	if err := h.authService.SendPhoneOTP(r.Context(), claims.UserID, req.PhoneNumber, req.Channel, req.Iso2); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Verification code sent successfully", nil)
}

// VerifyPhoneOTPRequest represents the payload to verify phone OTP
type VerifyPhoneOTPRequest struct {
	PhoneNumber string `json:"phoneNumber" validate:"required"`
	OTP         string `json:"otp" validate:"required,len=6,numeric"`
	Iso2        string `json:"iso2" validate:"omitempty"`
}

// @Summary Verify Phone OTP
// @Description Verifies the 6-digit phone OTP and marks the phone as verified
// @Tags Auth
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body VerifyPhoneOTPRequest true "Verify Phone OTP request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /users/phone/verify [post]
func (h *Handler) VerifyPhoneOTP(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req VerifyPhoneOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	if err := h.validate.Struct(req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Validation failed: "+err.Error())
		return
	}

	if err := h.authService.VerifyPhoneOTP(r.Context(), claims.UserID, req.PhoneNumber, req.OTP, req.Iso2); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Phone number verified successfully", map[string]interface{}{
		"verified": true,
	})
}

// SaveOnboardingProfileRequest represents the payload for the user's personal details, address, and optional referral
type SaveOnboardingProfileRequest struct {
	FirstName      string `json:"firstName" validate:"omitempty,min=2,max=50" example:"Daniel"`
	MiddleName     string `json:"middleName,omitempty" validate:"omitempty,max=50" example:"Kalu"`
	LastName       string `json:"lastName" validate:"omitempty,min=2,max=50" example:"Chukwu"`
	DateOfBirth    string `json:"dateOfBirth" validate:"omitempty" example:"1998-05-14"`
	CountryID      int16  `json:"countryId,omitempty" validate:"omitempty" example:"161"`
	CountryCode    string `json:"countryCode,omitempty" validate:"omitempty" example:"NG"`
	State          string `json:"state,omitempty" validate:"omitempty" example:"Lagos"`
	City           string `json:"city,omitempty" validate:"omitempty" example:"Ikeja"`
	StreetAddress  string `json:"streetAddress,omitempty" validate:"omitempty" example:"14 Admiralty Way"`
	PostalCode     string `json:"postalCode,omitempty" validate:"omitempty" example:"100001"`
	ReferralSource string `json:"referralSource,omitempty" validate:"omitempty" example:"Social Media"`
	ReferralCode   string `json:"referralCode,omitempty" validate:"omitempty" example:"CHIPA123"`
}

// UnmarshalJSON provides seamless backward-compatibility for snake_case and alias field names
// without exposing redundant fields in the public Swagger/OpenAPI documentation.
func (r *SaveOnboardingProfileRequest) UnmarshalJSON(data []byte) error {
	type Alias SaveOnboardingProfileRequest
	aux := struct {
		*Alias
		FirstNameSnake   *string `json:"first_name"`
		MiddleNameSnake  *string `json:"middle_name"`
		LastNameSnake    *string `json:"last_name"`
		DateOfBirthSnake *string `json:"date_of_birth"`
		DOB              *string `json:"dob"`
		CurrentCountry   *int16  `json:"current_country"`
		CurrentCountryC  *int16  `json:"currentCountry"`
		CountryCodeSnake *string `json:"country_code"`
		CurrentState     *string `json:"current_state"`
		CurrentCity      *string `json:"current_city"`
		StreetAddressS   *string `json:"street_address"`
		PostalCodeSnake  *string `json:"postal_code"`
		ReferralSourceS  *string `json:"referral_source"`
		ReferralCodeS    *string `json:"referral_code"`
	}{
		Alias: (*Alias)(r),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	if r.FirstName == "" && aux.FirstNameSnake != nil {
		r.FirstName = *aux.FirstNameSnake
	}
	if r.MiddleName == "" && aux.MiddleNameSnake != nil {
		r.MiddleName = *aux.MiddleNameSnake
	}
	if r.LastName == "" && aux.LastNameSnake != nil {
		r.LastName = *aux.LastNameSnake
	}
	if r.DateOfBirth == "" {
		if aux.DateOfBirthSnake != nil && *aux.DateOfBirthSnake != "" {
			r.DateOfBirth = *aux.DateOfBirthSnake
		} else if aux.DOB != nil && *aux.DOB != "" {
			r.DateOfBirth = *aux.DOB
		}
	}
	if r.CountryID <= 0 {
		if aux.CurrentCountry != nil && *aux.CurrentCountry > 0 {
			r.CountryID = *aux.CurrentCountry
		} else if aux.CurrentCountryC != nil && *aux.CurrentCountryC > 0 {
			r.CountryID = *aux.CurrentCountryC
		}
	}
	if r.CountryCode == "" && aux.CountryCodeSnake != nil {
		r.CountryCode = *aux.CountryCodeSnake
	}
	if r.State == "" && aux.CurrentState != nil {
		r.State = *aux.CurrentState
	}
	if r.City == "" && aux.CurrentCity != nil {
		r.City = *aux.CurrentCity
	}
	if r.StreetAddress == "" && aux.StreetAddressS != nil {
		r.StreetAddress = *aux.StreetAddressS
	}
	if r.PostalCode == "" && aux.PostalCodeSnake != nil {
		r.PostalCode = *aux.PostalCodeSnake
	}
	if r.ReferralSource == "" && aux.ReferralSourceS != nil {
		r.ReferralSource = *aux.ReferralSourceS
	}
	if r.ReferralCode == "" && aux.ReferralCodeS != nil {
		r.ReferralCode = *aux.ReferralCodeS
	}

	return nil
}

// @Summary Save Onboarding Profile
// @Description Updates user profile with personal information and address during onboarding
// @Tags Auth
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body SaveOnboardingProfileRequest true "Onboarding profile details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /users/me/onboarding [patch]
func (h *Handler) SaveOnboardingProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req SaveOnboardingProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	currentCountry := req.CountryID
	if currentCountry <= 0 && req.CountryCode != "" {
		if cID, err := h.authService.GetCountryIDByIso2(r.Context(), req.CountryCode); err == nil && cID > 0 {
			currentCountry = cID
		}
	}
	if currentCountry <= 0 {
		currentCountry = 161
	}

	params := auth.OnboardingProfileParams{
		PublicID:       claims.PublicID,
		FirstName:      req.FirstName,
		MiddleName:     req.MiddleName,
		LastName:       req.LastName,
		DateOfBirth:    req.DateOfBirth,
		CurrentCountry: currentCountry,
		CurrentState:   req.State,
		CurrentCity:    req.City,
		StreetAddress:  req.StreetAddress,
		PostalCode:     req.PostalCode,
		ReferralSource: req.ReferralSource,
		ReferralCode:   req.ReferralCode,
	}

	if err := h.authService.UpdateOnboardingProfile(r.Context(), claims.UserID, params); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Profile saved successfully", nil)
}

