package authservice

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math/big"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"chipa/api/internal/config"
	"chipa/api/internal/crypto"
	"chipa/api/internal/db"
	"chipa/api/internal/db/queries"
	"chipa/api/internal/logger"
	usersservice "chipa/api/internal/service/users"
	"chipa/api/internal/utils"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

type MessagingService interface {
	SendWhatsAppOTP(phone, otp string) error
	SendSmsOTP(phone, otp string) error
}

type UsersService interface {
	GetUserByFakeID(ctx context.Context, publicID string) (queries.UserWithPlaces, error)
	GetUserRoles(ctx context.Context, userID int64) (queries.CachedUserRoles, error)
	AssignUserRole(ctx context.Context, userID int64, publicID string, roleCode string, whoAssigned int64) error
	UpdateUserPhoneNumbers(ctx context.Context, userID int64, publicID string, phones []usersservice.PhonePayload) error
	CheckUsername(ctx context.Context, username string) (bool, string)
	CheckEmail(ctx context.Context, email string) (bool, string)
	CheckPhone(ctx context.Context, phone string, userPublicID string) (bool, string)
	CheckNIN(ctx context.Context, nin string) bool
	GenerateUniqueReferralCode(ctx context.Context, firstName string) (string, error)
	GetReferralCodeInfo(ctx context.Context, code string) (*usersservice.CachedReferralCodeInfo, error)
	InvalidateCachedUserInfo(ctx context.Context, publicID string) error
	InvalidateCachedUserRoles(ctx context.Context, userID int64) error
}

type AuthService struct {
	pool             *pgxpool.Pool
	queries          *queries.Queries
	rdb              *redis.Client
	messagingService MessagingService
	usersService     UsersService
	vault            *crypto.Vault
	jwtSecret        string
	jwtAccessExp     time.Duration
	jwtRefreshExp    time.Duration
}

func NewAuthService(
	pool *pgxpool.Pool,
	queries *queries.Queries,
	rdb *redis.Client,
	messagingService MessagingService,
	usersService UsersService,
	jwtSecret string,
	jwtAccessExp time.Duration,
	jwtRefreshExp time.Duration,
) *AuthService {
	return &AuthService{
		pool:             pool,
		queries:          queries,
		rdb:              rdb,
		messagingService: messagingService,
		usersService:     usersService,
		vault:            crypto.NewVault(),
		jwtSecret:        jwtSecret,
		jwtAccessExp:     jwtAccessExp,
		jwtRefreshExp:    jwtRefreshExp,
	}
}

type LoginResult struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	User         LoginUser `json:"user"`
}

type AuthTokens struct {
	AccessToken  string
	RefreshToken string
}

type LoginUser struct {
	ID             int64    `json:"id"`
	PublicID       string   `json:"public_id"`
	Email          string   `json:"email"`
	Username       string   `json:"username"`
	ReferralCode   string   `json:"referral_code"`
	FirstName      string   `json:"first_name"`
	LastName       string   `json:"last_name"`
	MiddleName     string   `json:"middle_name"`
	Gender         string   `json:"gender"`
	Avatar         string   `json:"avatar"`
	Phone          string   `json:"phone"`
	Roles          []string `json:"roles"`
	AccountStatus  string   `json:"account_status"`
	CurrentCountry int16    `json:"current_country,omitempty"`
	CurrentState   int16    `json:"current_state,omitempty"`
	CurrentCity    int32    `json:"current_city,omitempty"`
}

func (s *AuthService) Login(
	ctx context.Context,
	identifierType,
	identifier,
	password string,
	iso2 string,
	allowedRoles ...string,
) (LoginResult, error) {
	_ = logger.FromContext(ctx).With("component", logger.ComponentAuthService)
	identifier = strings.TrimSpace(strings.ToLower(identifier))

	var publicID string

	switch identifierType {
	case "email":
		identifier = strings.TrimSpace(strings.ToLower(identifier))
		exists, pID := s.usersService.CheckEmail(ctx, identifier)
		if !exists || pID == "" {
			return LoginResult{}, errors.New("Invalid email or password")
		}
		publicID = pID

	case "username":
		exists, pID := s.usersService.CheckUsername(ctx, identifier)
		if !exists || pID == "" {
			return LoginResult{}, errors.New("invalid username or password")
		}
		publicID = pID

	case "phone":
		// validate iso2
		if iso2 == "" {
			return LoginResult{}, errors.New("iso2 is required")
		}

		// validate phone number using the provided iso2
		formattedPhone, err := utils.ValidatePhoneForCountry(identifier, iso2)
		if err != nil {
			return LoginResult{}, err
		}

		exists, pID := s.usersService.CheckPhone(ctx, formattedPhone, "")
		if !exists || pID == "" {
			return LoginResult{}, errors.New("invalid phone number or password")
		}
		publicID = pID
	default:
		return LoginResult{}, errors.New("invalid identifier type")
	}

	// fetch the user details using the publicID
	user, err := s.GetUserDetailsByFakeID(ctx, publicID)
	if err != nil {
		return LoginResult{}, errors.New("invalid login details provided")
	}

	// Fetch the user's assigned roles from the database
	userRolesData, err := s.usersService.GetUserRoles(ctx, user.ID)
	if err != nil {
		return LoginResult{}, errors.New("failed to fetch user roles")
	}

	userRoleCodes := userRolesData.RolesCode

	// Role Validation
	if len(allowedRoles) > 0 {
		// Check if the user has at least one of the roles required to perform this action (allowedRoles)
		hasRole := false
		for _, allowedRole := range allowedRoles {
			for _, userRoleC := range userRoleCodes {
				if userRoleC == allowedRole {
					hasRole = true
					break // Stop checking once a matching role is found
				}
			}
			if hasRole {
				break
			}
		}

		// If after checking all allowed roles, the user doesn't have any of them, deny access
		if !hasRole {
			return LoginResult{}, errors.New("insufficient permissions")
		}
	}

	// Fetch the actual password hash directly from the database
	actualPasswordHash, err := s.queries.GetUserPasswordHashByPublicID(ctx, publicID)
	if err != nil {
		return LoginResult{}, errors.New("invalid login details provided")
	}

	//  Check if password matches
	err = bcrypt.CompareHashAndPassword([]byte(actualPasswordHash), []byte(password))
	if err != nil {
		return LoginResult{}, errors.New("invalid email, username, phone or password")
	}

	// Verify account status
	status := user.AccountStatus.String
	if status == "suspended" || status == "banned" || status == "deleted" || status == "inactive" {
		return LoginResult{}, fmt.Errorf("your account is %s", status)
	}
	if status == "placeholder" {
		return LoginResult{}, errors.New(`
			Your account is not activated, you cannot login into a placeholder account. Please contact an
			admin to activate your account
		`)
	}

	partyID := user.PartyID.Int16

	// create session and generate tokens
	return s.finalizeLogin(ctx, user, userRoleCodes, partyID)
}

func (s *AuthService) finalizeLogin(ctx context.Context, user queries.UserWithPlaces, userRoleCodes []string, partyID int16) (LoginResult, error) {
	log := logger.FromContext(ctx).With("component", logger.ComponentAuthService)
	tokens, err := s.createSession(ctx, user.ID, user.PublicID, user.Username.String, userRoleCodes, partyID)
	if err != nil {
		log.Error(logger.EventRedisPipelineFailed, "error", err, "operation", "login_session_storage")
		return LoginResult{}, err
	}

	if s.pool != nil {
		_, _ = s.pool.Exec(ctx, "UPDATE users SET last_login_at = NOW() WHERE id = $1", user.ID)

		var pfFirstName, pfLastName, pfMiddleName, pfGender, pfAvatar string
		_ = s.pool.QueryRow(ctx, `
			SELECT COALESCE(first_name, ''), COALESCE(last_name, ''), COALESCE(middle_name, ''), COALESCE(gender, ''), COALESCE(avatar_url, '')
			FROM user_profiles WHERE user_id = $1
		`, user.ID).Scan(&pfFirstName, &pfLastName, &pfMiddleName, &pfGender, &pfAvatar)
		if pfFirstName != "" { user.FirstName.String = pfFirstName; user.FirstName.Valid = true }
		if pfLastName != "" { user.LastName.String = pfLastName; user.LastName.Valid = true }
		if pfMiddleName != "" { user.MiddleName.String = pfMiddleName; user.MiddleName.Valid = true }
		if pfGender != "" { user.Gender.String = pfGender; user.Gender.Valid = true }
		if pfAvatar != "" { user.Avatar.String = pfAvatar; user.Avatar.Valid = true }
	}

	loginResult := LoginResult{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		User: LoginUser{
			ID:             user.ID,
			PublicID:       user.PublicID,
			Email:          user.Email.String,
			Username:       user.Username.String,
			ReferralCode:   user.ReferralCode.String,
			FirstName:      user.FirstName.String,
			LastName:       user.LastName.String,
			MiddleName:     user.MiddleName.String,
			Gender:         user.Gender.String,
			Avatar:         user.Avatar.String,
			Phone:          user.Phone.String,
			Roles:          userRoleCodes,
			AccountStatus:  user.AccountStatus.String,
			CurrentCountry: user.CurrentCountry,
			CurrentState:   user.CurrentState,
			CurrentCity:    user.CurrentCity.Int32,
		},
	}

	return loginResult, nil
}

type LoginCredentialsResult struct {
	PreAuthToken string      `json:"preAuthToken"`
	RequiresPIN  bool        `json:"requiresPin"`
	User         PreAuthUser `json:"user"`
}

type PreAuthUser struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Avatar    string `json:"avatar"`
}

type PreAuthSessionData struct {
	UserID   int64  `json:"userId"`
	PublicID string `json:"publicId"`
	Email    string `json:"email"`
	Attempts int    `json:"attempts"`
}

// LoginCredentials verifies Phase 1 credentials (identifier and password) and returns a short-lived pre-auth token
func (s *AuthService) LoginCredentials(ctx context.Context, identifier, password, identifierType, iso2 string) (LoginCredentialsResult, error) {
	identifier = strings.TrimSpace(strings.ToLower(identifier))
	if identifier == "" {
		return LoginCredentialsResult{}, errors.New("identifier is required")
	}
	if password == "" {
		return LoginCredentialsResult{}, errors.New("password is required")
	}

	if identifierType == "" {
		if strings.Contains(identifier, "@") {
			identifierType = "email"
		} else if strings.HasPrefix(identifier, "+") {
			identifierType = "phone"
		} else {
			identifierType = "email"
		}
	}

	var publicID string
	switch identifierType {
	case "email":
		exists, pID := s.usersService.CheckEmail(ctx, identifier)
		if !exists || pID == "" {
			return LoginCredentialsResult{}, errors.New("Invalid email or password")
		}
		publicID = pID
	case "username":
		exists, pID := s.usersService.CheckUsername(ctx, identifier)
		if !exists || pID == "" {
			return LoginCredentialsResult{}, errors.New("Invalid username or password")
		}
		publicID = pID
	case "phone":
		if iso2 == "" {
			iso2 = "NG"
		}
		formattedPhone, err := utils.ValidatePhoneForCountry(identifier, iso2)
		if err != nil {
			return LoginCredentialsResult{}, err
		}
		exists, pID := s.usersService.CheckPhone(ctx, formattedPhone, "")
		if !exists || pID == "" {
			return LoginCredentialsResult{}, errors.New("Invalid phone number or password")
		}
		publicID = pID
	default:
		return LoginCredentialsResult{}, errors.New("invalid identifier type")
	}

	user, err := s.GetUserDetailsByFakeID(ctx, publicID)
	if err != nil {
		return LoginCredentialsResult{}, errors.New("invalid login details provided")
	}

	actualPasswordHash, err := s.queries.GetUserPasswordHashByPublicID(ctx, publicID)
	if err != nil {
		return LoginCredentialsResult{}, errors.New("invalid login details provided")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(actualPasswordHash), []byte(password)); err != nil {
		return LoginCredentialsResult{}, errors.New("Invalid email or password")
	}

	status := user.AccountStatus.String
	if status == "suspended" || status == "banned" || status == "deleted" || status == "inactive" {
		return LoginCredentialsResult{}, fmt.Errorf("your account is %s", status)
	}
	if status == "placeholder" {
		return LoginCredentialsResult{}, errors.New("your account is not activated. Please complete onboarding")
	}

	preAuthToken := fmt.Sprintf("pat_%s", uuid.NewString())
	sessionData := PreAuthSessionData{
		UserID:   user.ID,
		PublicID: publicID,
		Email:    user.Email.String,
		Attempts: 0,
	}
	sessionJSON, err := json.Marshal(sessionData)
	if err != nil {
		return LoginCredentialsResult{}, fmt.Errorf("failed to encode session: %w", err)
	}

	if s.rdb != nil {
		redisKey := fmt.Sprintf("%s%s", db.RedisLoginPreAuth, preAuthToken)
		_ = s.rdb.Set(ctx, redisKey, sessionJSON, 5*time.Minute).Err()
	}

	var firstName, lastName, avatar string
	if s.pool != nil {
		_ = s.pool.QueryRow(ctx, `
			SELECT COALESCE(first_name, ''), COALESCE(last_name, ''), COALESCE(avatar_url, '')
			FROM user_profiles WHERE user_id = $1
		`, user.ID).Scan(&firstName, &lastName, &avatar)
	}
	if firstName == "" {
		firstName = user.FirstName.String
	}
	if lastName == "" {
		lastName = user.LastName.String
	}
	if avatar == "" {
		avatar = user.Avatar.String
	}

	return LoginCredentialsResult{
		PreAuthToken: preAuthToken,
		RequiresPIN:  true,
		User: PreAuthUser{
			FirstName: firstName,
			LastName:  lastName,
			Email:     user.Email.String,
			Avatar:    avatar,
		},
	}, nil
}

// LoginPin verifies Phase 2 (the 4-digit transaction PIN) and issues the authenticated JWT session
func (s *AuthService) LoginPin(ctx context.Context, preAuthToken, pin string) (LoginResult, error) {
	if preAuthToken == "" {
		return LoginResult{}, errors.New("preAuthToken is required")
	}
	if len(pin) != 4 {
		return LoginResult{}, errors.New("PIN must be exactly 4 digits")
	}

	var session PreAuthSessionData
	redisKey := fmt.Sprintf("%s%s", db.RedisLoginPreAuth, preAuthToken)
	if s.rdb != nil {
		sessionJSON, err := s.rdb.Get(ctx, redisKey).Result()
		if err != nil || sessionJSON == "" {
			return LoginResult{}, errors.New("login session expired or invalid. Please log in again")
		}
		if err := json.Unmarshal([]byte(sessionJSON), &session); err != nil {
			return LoginResult{}, errors.New("failed to parse login session")
		}
		if session.Attempts >= 5 {
			s.rdb.Del(ctx, redisKey)
			return LoginResult{}, errors.New("too many incorrect PIN attempts. Please log in again")
		}
	} else {
		return LoginResult{}, errors.New("session store unavailable")
	}

	var pinHash string
	if s.pool != nil {
		_ = s.pool.QueryRow(ctx, "SELECT COALESCE(pin_hash, '') FROM users WHERE id = $1", session.UserID).Scan(&pinHash)
	}

	pinValid := false
	if pinHash == "" {
		pinValid = (pin == "1234") // sandbox fallback
	} else {
		err := bcrypt.CompareHashAndPassword([]byte(pinHash), []byte(pin))
		pinValid = (err == nil)
	}

	if !pinValid {
		session.Attempts++
		updatedJSON, _ := json.Marshal(session)
		ttl, _ := s.rdb.TTL(ctx, redisKey).Result()
		if ttl > 0 {
			s.rdb.Set(ctx, redisKey, updatedJSON, ttl)
		}
		return LoginResult{}, errors.New("incorrect PIN. Please try again")
	}

	// Invalidate preAuthToken so it cannot be reused
	s.rdb.Del(ctx, redisKey)

	user, err := s.GetUserDetailsByFakeID(ctx, session.PublicID)
	if err != nil {
		return LoginResult{}, errors.New("failed to load user details")
	}

	userRolesData, _ := s.usersService.GetUserRoles(ctx, user.ID)
	return s.finalizeLogin(ctx, user, userRolesData.RolesCode, user.PartyID.Int16)
}

// createSession creates a new login session, generates access/refresh tokens, and persists session data in Redis
func (s *AuthService) createSession(
	ctx context.Context,
	userID int64,
	publicID string,
	username string,
	roles []string,
	partyID int16,
) (AuthTokens, error) {
	sessionID := uuid.NewString()
	now := time.Now().UTC()
	sessionData := TokenSessionData{
		SessionID: sessionID,
		PublicID:  publicID,
		TimeAdded: now.Format(time.RFC3339),
	}
	jsonSessionData, err := json.Marshal(sessionData)
	if err != nil {
		return AuthTokens{}, fmt.Errorf("failed to marshal session data: %w", err)
	}

	accessToken, err := utils.GenerateToken(userID, publicID, username, roles, s.jwtSecret, s.jwtAccessExp, partyID)
	if err != nil {
		return AuthTokens{}, fmt.Errorf("failed to generate access token: %w", err)
	}

	randStr, err := utils.GenerateRandomString()
	if err != nil {
		return AuthTokens{}, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	pipe := s.rdb.TxPipeline()
	redisRefreshKey := fmt.Sprintf("%s%s", db.RedisJwtRefreshToken, randStr.HashedToken)
	pipe.Set(ctx, redisRefreshKey, jsonSessionData, s.jwtRefreshExp)

	redisLoginSessionKey := fmt.Sprintf("%s%s", db.RedisSessionTokens, sessionID)
	pipe.SAdd(ctx, redisLoginSessionKey, randStr.HashedToken)
	pipe.Expire(ctx, redisLoginSessionKey, s.jwtRefreshExp)

	redisUserSessionKey := fmt.Sprintf("%s%s", db.RedisUserLoginSessions, publicID)
	pipe.SAdd(ctx, redisUserSessionKey, sessionID)
	pipe.Expire(ctx, redisUserSessionKey, s.jwtRefreshExp)

	if _, err = pipe.Exec(ctx); err != nil {
		return AuthTokens{}, fmt.Errorf("failed to execute redis pipeline: %w", err)
	}

	return AuthTokens{
		AccessToken:  accessToken,
		RefreshToken: randStr.RandomString,
	}, nil
}

type RefreshResult struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	User         LoginUser `json:"user"`
}

type TokenSessionData struct {
	PublicID  string `json:"PublicID"`
	SessionID string `json:"SessionID"`
	TimeAdded string `json:"TimeAdded"`
}

// Refresh validates the refresh token and returns a new set of tokens
func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (RefreshResult, error) {
	// init logger
	log := logger.FromContext(ctx).With("component", logger.ComponentAuthService)

	// hash the refresh token
	hashed := utils.HashToken(refreshToken)

	// use token to fetch jwt session details from redis
	currentRedisTokenKey := fmt.Sprintf("%s%s", db.RedisJwtRefreshToken, hashed)
	sessionDts, err := s.rdb.Get(ctx, currentRedisTokenKey).Result()
	if err != nil {
		return RefreshResult{}, errors.New("invalid or expired refresh token")
	}

	// unmarshal the session details
	var sessionData TokenSessionData
	err = json.Unmarshal([]byte(sessionDts), &sessionData)
	if err != nil {
		return RefreshResult{}, errors.New("having issues with unpacking token details")
	}

	// Parse the RFC3339 string back into a time.Time
	parsedTime, err := time.Parse(time.RFC3339, sessionData.TimeAdded)
	if err != nil {
		return RefreshResult{}, fmt.Errorf("error parsing time: %v", err)
	}

	// will only acquire lock after 10 minutes of the token being generated
	// this is to avoid concurrent token generation and speed up the process
	// this is a grace period for the token rotation
	isGracePeriod := time.Since(parsedTime) < 10*time.Minute

	// acquire lock before expensive DB queries if time expired
	if !isGracePeriod {
		// Redis key for user login lock
		lockKey := fmt.Sprintf("%s%s", db.RedisJwtUserLoginLocked, sessionData.PublicID)

		// acquire lock
		result, err := s.rdb.SetArgs(ctx, lockKey, "yes", redis.SetArgs{
			TTL:  10 * time.Second,
			Mode: "NX", // only set if not exists
		}).Result()

		// check if lock was acquired
		if errors.Is(err, redis.Nil) {
			return RefreshResult{}, errors.New("token generation in progress")
		}

		// check for other errors
		if err != nil {
			return RefreshResult{}, err
		}

		// check if lock was acquired
		if result != "OK" {
			return RefreshResult{}, errors.New("token generation in progress")
		}

		// release the lock after successful re-assignment of tokens
		defer s.rdb.Del(ctx, lockKey)
	}

	// get the user details using the PublicID
	user, err := s.GetUserDetailsByFakeID(ctx, sessionData.PublicID)
	if err != nil {
		return RefreshResult{}, errors.New("user not found")
	}

	// get user party id
	var userPartyID int16
	if user.PartyID.Valid {
		userPartyID = user.PartyID.Int16
	}

	// user details
	userDetails := LoginUser{
		ID:             user.ID,
		PublicID:       user.PublicID,
		Email:          user.Email.String,
		Username:       user.Username.String,
		ReferralCode:   user.ReferralCode.String,
		FirstName:      user.FirstName.String,
		LastName:       user.LastName.String,
		MiddleName:     user.MiddleName.String,
		Gender:         user.Gender.String,
		Avatar:         user.Avatar.String,
		Phone:          user.Phone.String,
		Roles:          user.Roles.RolesCode,
		AccountStatus:  user.AccountStatus.String,
		CurrentCountry: user.CurrentCountry,
		CurrentState:   user.CurrentState,
		CurrentCity:    user.CurrentCity.Int32,
	}

	// Verify account status
	accountStatus := user.AccountStatus.String
	if accountStatus == "suspended" || accountStatus == "banned" || accountStatus == "deleted" || accountStatus == "inactive" {
		return RefreshResult{}, errors.New("your account is not active")
	}
	if accountStatus == "placeholder" {
		return RefreshResult{}, errors.New("Placeholder account cannot be logged in")
	}

	// if time is still within the grace period, return the user details
	if isGracePeriod {
		return RefreshResult{
			User: userDetails,
		}, nil
	}

	// update the time of this new accessToken generated
	now := time.Now().UTC()
	sessionData.TimeAdded = now.Format(time.RFC3339)

	//convert to json
	jsonSessionData, _ := json.Marshal(sessionData)

	// Generate a new Access Token
	newAccessToken, err := utils.GenerateToken(user.ID, sessionData.PublicID, user.Username.String, user.Roles.RolesCode, s.jwtSecret, s.jwtAccessExp, userPartyID)
	if err != nil {
		return RefreshResult{}, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate a new refresh token
	refresh, err := utils.GenerateRandomString()
	if err != nil {
		return RefreshResult{}, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Redis session key
	redisSessionKey := fmt.Sprintf("%s%s", db.RedisSessionTokens, sessionData.SessionID)
	pipe := s.rdb.TxPipeline()

	// expire old token (rotation grace period) and cleanup session tokens
	pipe.Expire(ctx, currentRedisTokenKey, 1*time.Minute) // keeps the token for 1 minute for concurrent requests
	pipe.SRem(ctx, redisSessionKey, hashed)               // deletes the token from the list of session tokens

	// Store the new refresh token, but we use the hashed string as the key
	newRedisTokenKey := fmt.Sprintf("%s%s", db.RedisJwtRefreshToken, refresh.HashedToken)
	pipe.Set(ctx, newRedisTokenKey, jsonSessionData, s.jwtRefreshExp)

	// add the new refresh token to the session SET
	pipe.SAdd(ctx, redisSessionKey, refresh.HashedToken)
	pipe.Expire(ctx, redisSessionKey, s.jwtRefreshExp) // let the whole set expire in s.jwtRefreshExp

	// execute the pipeline
	_, err = pipe.Exec(ctx)
	if err != nil {
		log.Error(logger.EventRedisPipelineFailed, "error", err, "operation", "refresh_token_storage")
		return RefreshResult{}, fmt.Errorf("failed to execute redis pipeline: %w", err)
	}

	// logs token refreshed successfully
	log.Info(logger.EventTokenRefreshSuccess, "user_id", sessionData.PublicID)

	// set the response data
	return RefreshResult{
		AccessToken:  newAccessToken,
		RefreshToken: refresh.RandomString,
		User:         userDetails,
	}, nil
}

// Logout invalidates the refresh token by removing the session from Redis
func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	log := logger.FromContext(ctx).With("component", logger.ComponentAuthService)

	// hash the refresh token
	hashed := utils.HashToken(refreshToken)
	// return errors.New("testing error")

	// use token to fetch jwt session details from redis
	tokenRedisKey := fmt.Sprintf("%s%s", db.RedisJwtRefreshToken, hashed)
	sessionDts, err := s.rdb.Get(ctx, tokenRedisKey).Result()
	if errors.Is(err, redis.Nil) {
		return errors.New("invalid or expired refresh token")
	}
	if err != nil {
		return err
	}

	// unmarshal the session details
	var sessionData TokenSessionData
	if err := json.Unmarshal([]byte(sessionDts), &sessionData); err != nil {
		return errors.New("failed to destructure the session data")
	}

	// get the sessionID from the session details
	sessionID := sessionData.SessionID
	userPublicID := sessionData.PublicID
	redisSessionKey := fmt.Sprintf("%s%s", db.RedisSessionTokens, sessionID)

	// get all tokens in the redisSessionKey set
	tokens, err := s.rdb.SMembers(ctx, redisSessionKey).Result()
	if err != nil {
		return errors.New("failed to retrieve all your tokens")
	}

	// create a pipeline to delete all tokens in the redisSessionKey set
	pipe := s.rdb.TxPipeline()
	for _, token := range tokens {
		// delete the token from redis
		tokenRedisKey := fmt.Sprintf("%s%s", db.RedisJwtRefreshToken, token)
		pipe.Del(ctx, tokenRedisKey)
	}

	// delete the session set itself
	pipe.Del(ctx, redisSessionKey)

	// remove the session from the user sessions set
	userRedisKey := fmt.Sprintf("%s%s", db.RedisUserLoginSessions, userPublicID)
	pipe.SRem(ctx, userRedisKey, sessionID) // delete the current session

	// fetches all the session in the user session set, and check if they are still valid, if-not-valid, we delete the session
	members, err := s.rdb.SMembers(ctx, userRedisKey).Result()
	if err == nil {
		for _, sessionUID := range members {
			// check if the session is still valid
			redisSessionKey := fmt.Sprintf("%s%s", db.RedisSessionTokens, sessionUID)
			_, err := s.rdb.Get(ctx, redisSessionKey).Result()
			if errors.Is(err, redis.Nil) {
				// session is not valid, delete it
				pipe.SRem(ctx, userRedisKey, sessionUID)
			}
		}
	}

	// send the pipeline to redis and check for errors
	_, err = pipe.Exec(ctx)
	if err != nil {
		log.Error(logger.EventRedisPipelineFailed, "error", err, "operation", "logout")
		return errors.New("piping the redis command failed")
	}

	log.Info(logger.EventUserLogoutSuccess, "user_id", userPublicID)
	return nil
}

// CleanUsername normalizes and validates a username based on:

// 1. Alphanumeric start/end
// 2. No consecutive dots/underscores
// 3. Length between 2-30 chars
// 4. Case-insensitivity (returns lowercase)
func CleanUsername(input string) (string, error) {
	// 1. Trim whitespace and normalize to lowercase
	clean := strings.ToLower(strings.TrimSpace(input))

	// 2. Check length (2-30 characters)
	if len(clean) < 2 || len(clean) > 30 {
		return "", errors.New("username must be between 2 and 30 characters")
	}

	// 3. Define the Regex based on your logic:
	// The regex pattern is designed to match a string that starts and ends with
	// alphanumeric characters, and contains zero or more alphanumeric characters,
	// and zero or more dots or underscores in between.
	//
	// The pattern is split into two parts:
	// - The start and end of the string are checked for alphanumeric characters.
	// - The middle part is checked for alphanumeric characters and dots or underscores.
	validPattern := regexp.MustCompile(`^[a-z][a-z0-9._]{1,28}[a-z0-9]$`)
	if !validPattern.MatchString(clean) {
		return "", errors.New("username can only contain letters, numbers, and underscores")
	}

	// 4. Manual check for consecutive symbols (since Go regex doesn't do lookahead)
	if strings.Contains(clean, "..") || strings.Contains(clean, "__") ||
		strings.Contains(clean, "._") || strings.Contains(clean, "_.") {
		return "", errors.New("username cannot contain consecutive underscores")
	}

	return clean, nil
}

// function: check if the username already exist in redis and in the postgres db
func (s *AuthService) CheckUsername(ctx context.Context, username string) bool {
	exists, _ := s.usersService.CheckUsername(ctx, username)
	return exists
}

func (s *AuthService) CheckReferralCode(ctx context.Context, code string) (bool, string, int64) {
	info, err := s.usersService.GetReferralCodeInfo(ctx, code)
	if err != nil || info == nil || info.ID == 0 {
		return false, "", 0
	}
	return true, info.Name, info.ID
}

// function: checks if the Email address already exists in redis and in the postgres db
func (s *AuthService) CheckEmail(ctx context.Context, email string) bool {
	exists, _ := s.usersService.CheckEmail(ctx, email)
	return exists
}

// function: checks if the phone exists in redis and in the postgres db
func (s *AuthService) CheckPhone(ctx context.Context, phone string) bool {
	exists, _ := s.usersService.CheckPhone(ctx, phone, "")
	return exists
}

// CheckNIN function checks if the nin already exists in the database
func (s *AuthService) CheckNIN(ctx context.Context, nin string) bool {
	return s.usersService.CheckNIN(ctx, nin)
}

type SignupResult struct {
	ID           string    `json:"id"`
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	User         LoginUser `json:"user"`
}

// GetCountryIDByIso2 resolves the c_countries.id from an ISO2 alpha-2 code (e.g. 'NG', 'US').
func (s *AuthService) GetCountryIDByIso2(ctx context.Context, iso2 string) (int16, error) {
	if s.pool != nil && iso2 != "" {
		var id int16
		err := s.pool.QueryRow(ctx, "SELECT id FROM c_countries WHERE UPPER(iso2) = UPPER($1) LIMIT 1", iso2).Scan(&id)
		if err == nil && id > 0 {
			return id, nil
		}
	}
	return 160, nil
}

// Signup performs the primary backend registration logic.
// In progressive onboarding, phone is optional at this stage and verified in subsequent steps.
func (s *AuthService) Signup(ctx context.Context, email, phone, password string, countryID int16, emailVerificationToken ...string) (SignupResult, error) {
	if countryID <= 0 {
		countryID = 161 // default to Nigeria (id 161 in c_countries)
	}
	// Check if email exists
	email = normalizeEmail(email)
	if email == "" {
		return SignupResult{}, errors.New("email is required")
	}
	if exists, _ := s.usersService.CheckEmail(ctx, email); exists {
		return SignupResult{}, errors.New("Email address already exists")
	}

	// Validate email verification token or raw 6-digit OTP from Redis if passed
	if len(emailVerificationToken) > 0 && emailVerificationToken[0] != "" {
		tokenOrCode := strings.TrimSpace(emailVerificationToken[0])
		tokenKey := s.emailOtpVerifiedKey(email)
		cachedToken, err := s.rdb.Get(ctx, tokenKey).Result()
		if err == nil && cachedToken != "" {
			if cachedToken != tokenOrCode {
				// cached verification token didn't match; check if tokenOrCode is the raw 6-digit OTP
				if otpErr := s.verifyAndConsumeEmailOTP(ctx, email, tokenOrCode); otpErr != nil {
					return SignupResult{}, errors.New("invalid or expired verification code")
				}
			}
		} else {
			// No verification token cached; try verifying tokenOrCode as the 6-digit OTP directly
			if otpErr := s.verifyAndConsumeEmailOTP(ctx, email, tokenOrCode); otpErr != nil {
				if s.rdb != nil {
					return SignupResult{}, errors.New("invalid or expired verification code")
				}
			}
		}
	}

	var e164Phone string
	if phone != "" {
		country_dts, err := s.queries.GetCountryByID(ctx, countryID)
		if err == nil {
			e164Phone, _ = utils.ValidatePhoneForCountry(phone, country_dts.Iso2)
		}
		if e164Phone != "" {
			if exists, _ := s.usersService.CheckPhone(ctx, e164Phone, ""); exists {
				return SignupResult{}, errors.New("phone already exists")
			}
		}
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return SignupResult{}, fmt.Errorf("failed to hash password: %w", err)
	}

	var userID int64
	var fakeID int64
	publicID := crypto.GeneratePublicID("usr")

	if s.pool != nil {
		var phoneArg interface{} = nil
		if e164Phone != "" {
			phoneArg = e164Phone
		}
		var countryIso2 string = "NG"
		if countryID > 0 {
			_ = s.pool.QueryRow(ctx, "SELECT UPPER(iso2) FROM c_countries WHERE id = $1 LIMIT 1", countryID).Scan(&countryIso2)
		}
		err = s.pool.QueryRow(ctx, `
			INSERT INTO users (public_id, email, phone, password_hash, country_code, nationality, current_country, account_status)
			VALUES ($1, $2, $3, $4, $5, $5, $6, 'just_registered')
			RETURNING id
		`, publicID, email, phoneArg, string(hashedPassword), countryIso2, countryID).Scan(&userID)
		if err != nil {
			if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
				switch pgErr.ConstraintName {
				case "users_email_key":
					return SignupResult{}, errors.New("Email address already exists")
				case "users_phone_key":
					return SignupResult{}, errors.New("phone already exists")
				}
			}
			return SignupResult{}, fmt.Errorf("failed to create user: %w", err)
		}
		fakeID = utils.GenerateFakeID(userID)
		_, _ = s.pool.Exec(ctx, "UPDATE users SET fake_id = $1 WHERE id = $2", fakeID, userID)
		// Initialize decoupled profile record with resolved nationality
		_, _ = s.pool.Exec(ctx, "INSERT INTO user_profiles (user_id, nationality) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET nationality = EXCLUDED.nationality", userID, countryIso2)
		// Initialize user_verifications record
		_, _ = s.pool.Exec(ctx, "INSERT INTO user_verifications (user_id, email_verified) VALUES ($1, true) ON CONFLICT (user_id) DO UPDATE SET email_verified = true", userID)
	} else {
		params := queries.CreateUserParams{
			Email:          pgtype.Text{String: email, Valid: email != ""},
			Phone:          pgtype.Text{String: e164Phone, Valid: e164Phone != ""},
			PasswordHash:   string(hashedPassword),
			CurrentCountry: countryID,
			CurrentState:   37,
		}
		var err error
		userID, err = s.queries.CreateUser(ctx, params)
		if err != nil {
			return SignupResult{}, fmt.Errorf("failed to create user: %w", err)
		}
		fakeID = utils.GenerateFakeID(userID)
		_ = s.queries.UpdateUserFakeID(ctx, queries.UpdateUserFakeIDParams{
			ID:       userID,
			PublicID: publicID,
		})
	}

	// save user email to redis
	_ = s.SaveSomeUserRegistrationDetails(ctx, "", email, "", userID, publicID)

	// Generate session and tokens (same pattern as Login)
	tokens, err := s.createSession(ctx, userID, publicID, "", nil, 0)
	if err != nil {
		return SignupResult{}, fmt.Errorf("failed to create session: %w", err)
	}

	return SignupResult{
		ID:           strconv.FormatInt(userID, 10),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		User: LoginUser{
			ID:             userID,
			PublicID:       publicID,
			Email:          email,
			Phone:          e164Phone,
			CurrentCountry: countryID,
			AccountStatus:  "just_registered",
		},
	}, nil
}

// CompleteOnboarding finalizes a newly registered user's profile with all data collected during the onboarding flow.
// It updates the user row, saves NIN + username to Redis/DB, stores security questions, and sets account status to 'active'.
func (s *AuthService) CompleteOnboarding(
	ctx context.Context,
	userID int64,
	publicID string,
	params queries.UpdateOnboardingProfileParams,
	referrerUserID *int64,
	nin string,
) error {
	// 1. Update the users row with all onboarding fields including referral code
	_, err := s.queries.UpdateOnboardingProfile(ctx, params)
	if err != nil {
		return fmt.Errorf("update profile: %w", err)
	}

	// record referrer user
	if referrerUserID != nil && *referrerUserID > 0 && *referrerUserID != userID {
		if _, err := s.queries.CreateReferral(ctx, queries.CreateReferralParams{
			PartyID:        pgtype.Int2{Valid: false}, // No party at signup
			ReferrerUserID: *referrerUserID,
			ReferredUserID: userID,
			Milestone:      "SIGNED_UP",
			Status:         pgtype.Text{String: "pending", Valid: true},
		}); err != nil {
			return fmt.Errorf("create referral record: %w", err)
		}
	}

	// 2. Persist username, email, nin to Redis for fast lookups
	if err := s.SaveSomeUserRegistrationDetails(ctx, params.Username.String, "", nin, userID, publicID); err != nil {
		return fmt.Errorf("save registration details: %w", err)
	}

	// 3. Invalidate the Redis user-info cache so the next read is fresh
	_ = s.usersService.InvalidateCachedUserInfo(ctx, publicID)

	return nil
}

// SaveSomeUserRegistrationDetails saves the user's registration details (username, email, nin) to Redis & DB
func (s *AuthService) SaveSomeUserRegistrationDetails(ctx context.Context, username, email, nin string, userID int64, publicID string) error {
	// batch redis commands
	pipe := s.rdb.TxPipeline()

	if username != "" {
		pipe.Set(ctx, db.RedisUsernameFakeID+username, publicID, db.RedisFiveYearsTTL)
	}
	if email != "" {
		pipe.Set(ctx, db.RedisEmailFakeID+email, publicID, db.RedisFiveYearsTTL)
	}

	_, err := pipe.Exec(ctx)
	if err != nil {
		return err
	}

	// save to encrypted identity vault
	if nin != "" {
		if s.vault != nil && s.pool != nil {
			encNIN, err := s.vault.Encrypt(nin)
			if err == nil {
				hashNIN := s.vault.BlindIndex(nin)
				_, _ = s.pool.Exec(ctx, `
					INSERT INTO identity_documents (user_id, document_type, document_number_encrypted, document_number_hash, status, verified_at)
					VALUES ($1, 'nin', $2, $3, 'verified', NOW())
					ON CONFLICT (user_id, document_type) DO UPDATE
					SET document_number_encrypted = EXCLUDED.document_number_encrypted,
					    document_number_hash = EXCLUDED.document_number_hash,
					    status = 'verified',
					    verified_at = NOW(),
					    updated_at = NOW()
				`, userID, encNIN, hashNIN)
			}
		}
	}

	return nil
}

const (
	emailOtpTTL         = 10 * time.Minute
	emailOtpVerifiedTTL = 30 * time.Minute
)

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func (s *AuthService) emailOtpKey(email string) string {
	return db.RedisRegisterEmailOtp + normalizeEmail(email)
}

func (s *AuthService) emailOtpVerifiedKey(email string) string {
	return db.RedisRegisterEmailOtpVerified + normalizeEmail(email)
}

func (s *AuthService) sendEmailOTP(ctx context.Context, to, otp string) error {
	from := config.GetEnv("RESEND_FROM_EMAIL", "")
	apiKey := config.GetEnv("RESEND_API_KEY", "")
	if from == "" || apiKey == "" {
		return errors.New("email service is not configured")
	}

	body := map[string]any{
		"from":    from,
		"to":      []string{to},
		"subject": "Your Chipa verification code",
		"html": fmt.Sprintf(`<div style="font-family:Arial,sans-serif;line-height:1.6">
			<h2>Verify your email</h2>
			<p>Your verification code is:</p>
			<div style="font-size:32px;font-weight:700;letter-spacing:6px">%s</div>
			<p>This code expires in 10 minutes.</p>
		</div>`, otp),
	}
	payload, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", strings.NewReader(string(payload)))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "chipa-api")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("resend email failed: %s", resp.Status)
	}
	return nil
}

// Maximum allowed failed verification attempts before an OTP is invalidated
const maxOTPAttempts = 5

// StoredEmailOTP represents the OTP payload cached in Redis
type StoredEmailOTP struct {
	Hash     string `json:"hash"`     // bcrypt hash of the OTP code
	Attempts int    `json:"attempts"` // count of failed verification attempts
}

type EmailOTPResult struct {
	Message                string `json:"message"`
	EmailVerificationToken string `json:"emailVerificationToken,omitempty"`
	ExpiresInSeconds       int    `json:"expiresInSeconds,omitempty"`
}

// generateAndSendEmailOTP generates a new OTP, emails it, and caches the hash in Redis
func (s *AuthService) generateAndSendEmailOTP(ctx context.Context, email string) (EmailOTPResult, error) {
	// 1. Generate plain 6-digit OTP and its bcrypt hash
	otp, hashedOTP, err := utils.GenerateOTP()
	if err != nil {
		return EmailOTPResult{}, err
	}

	// 2. Dispatch the plain OTP to the user's email
	if err := s.sendEmailOTP(ctx, email, otp); err != nil {
		return EmailOTPResult{}, err
	}

	// 3. Store the hashed OTP in Redis with initial 0 attempts and a TTL
	otpData, _ := json.Marshal(StoredEmailOTP{
		Hash:     hashedOTP,
		Attempts: 0,
	})
	if err := s.rdb.Set(ctx, s.emailOtpKey(email), otpData, emailOtpTTL).Err(); err != nil {
		return EmailOTPResult{}, err
	}

	// 4. Return success result with remaining expiration time
	return EmailOTPResult{
		Message:          "OTP sent successfully",
		ExpiresInSeconds: int(emailOtpTTL.Seconds()),
	}, nil
}

// SendSignupEmailOTP generates and sends an OTP to a new user's email address during the signup process
func (s *AuthService) SendSignupEmailOTP(ctx context.Context, email string) (EmailOTPResult, error) {
	// Normalize email format (e.g. lowercase, trim spaces)
	email = normalizeEmail(email)
	if email == "" {
		return EmailOTPResult{}, errors.New("email is required")
	}

	// Ensure the email is not already registered in the system
	if exists, _ := s.usersService.CheckEmail(ctx, email); exists {
		return EmailOTPResult{}, errors.New("Email address already exists")
	}

	// Generate, send, and cache OTP
	return s.generateAndSendEmailOTP(ctx, email)
}

// SendForgotPasswordEmailOTP sends a one-time code for password reset.
// Unlike SendSignupEmailOTP, it requires the email to already exist.
func (s *AuthService) SendForgotPasswordEmailOTP(ctx context.Context, email string) (EmailOTPResult, error) {
	email = normalizeEmail(email)
	if email == "" {
		return EmailOTPResult{}, errors.New("email is required")
	}
	if exists, _ := s.usersService.CheckEmail(ctx, email); !exists {
		return EmailOTPResult{}, errors.New("no account found with that email address")
	}

	// Generate, send, and cache OTP
	return s.generateAndSendEmailOTP(ctx, email)
}

// verifyAndConsumeEmailOTP checks the OTP against the stored hash in Redis with brute-force attempt tracking.
// If valid, the OTP is deleted from Redis immediately.
func (s *AuthService) verifyAndConsumeEmailOTP(ctx context.Context, email, otp string) error {
	// 1. Validate and clean input parameters
	email = normalizeEmail(email)
	if email == "" {
		return errors.New("email is required")
	}
	otp = strings.TrimSpace(otp)
	if otp == "" {
		return errors.New("otp code is required")
	}

	// 2. Fetch the cached OTP record from Redis
	key := s.emailOtpKey(email)
	raw, err := s.rdb.Get(ctx, key).Result()
	if err != nil {
		return errors.New("otp expired or not found")
	}

	// 3. Deserialize the stored hash and attempt count
	var stored StoredEmailOTP
	if err := json.Unmarshal([]byte(raw), &stored); err != nil {
		return errors.New("invalid otp state")
	}

	// 4. Check if max brute-force attempts have already been reached
	if stored.Attempts >= maxOTPAttempts {
		_ = s.rdb.Del(ctx, key).Err()
		return errors.New("too many failed attempts, please request a new code")
	}

	// 5. Compare the submitted OTP with the stored bcrypt hash
	if err := bcrypt.CompareHashAndPassword([]byte(stored.Hash), []byte(otp)); err != nil {
		stored.Attempts++
		// Invalidate OTP immediately on reaching the limit
		if stored.Attempts >= maxOTPAttempts {
			_ = s.rdb.Del(ctx, key).Err()
			return errors.New("too many failed attempts, please request a new code")
		}

		// Persist the incremented attempt count while preserving remaining key TTL
		ttl := s.rdb.TTL(ctx, key).Val()
		if ttl > 0 {
			updatedData, _ := json.Marshal(stored)
			_ = s.rdb.Set(ctx, key, updatedData, ttl).Err()
		}

		// 6. Calculate remaining attempts and return error
		remaining := maxOTPAttempts - stored.Attempts
		return fmt.Errorf("invalid otp (%d attempt(s) remaining)", remaining)
	}

	// 7. Consume and remove the OTP from Redis on successful verification
	_ = s.rdb.Del(ctx, key).Err()
	return nil
}

// VerifySignupEmailOTP validates the submitted OTP against the stored hash and generates a verification token upon success
func (s *AuthService) VerifySignupEmailOTP(ctx context.Context, email, otp string) (EmailOTPResult, error) {
	// 1. Verify and consume OTP with brute-force protection
	if err := s.verifyAndConsumeEmailOTP(ctx, email, otp); err != nil {
		return EmailOTPResult{}, err
	}

	// 2. Generate and store temporary email verification token in Redis
	email = normalizeEmail(email)
	verificationToken := uuid.NewString()
	if err := s.rdb.Set(ctx, s.emailOtpVerifiedKey(email), verificationToken, emailOtpVerifiedTTL).Err(); err != nil {
		return EmailOTPResult{}, err
	}

	// 3. Return success response with the verification token and its expiration
	return EmailOTPResult{
		Message:                "Email verified successfully",
		EmailVerificationToken: verificationToken,
		ExpiresInSeconds:       int(emailOtpVerifiedTTL.Seconds()),
	}, nil
}

// GetUserDetailsByFakeID fetches all user details using the user public_id
func (s *AuthService) GetUserDetailsByFakeID(ctx context.Context, publicID string) (queries.UserWithPlaces, error) {
	return s.usersService.GetUserByFakeID(ctx, publicID)
}

// ChangePasswordByEmail resets a user's password using their email address and OTP
func (s *AuthService) ChangePasswordByEmail(ctx context.Context, email, otp, newPassword string) error {
	email = normalizeEmail(email)
	if email == "" {
		return errors.New("email is required")
	}
	if len(newPassword) < 5 {
		return errors.New("password must be at least 5 characters")
	}

	// 1. Verify and consume OTP with brute-force attempt limits
	if err := s.verifyAndConsumeEmailOTP(ctx, email, otp); err != nil {
		return err
	}

	// 2. Resolve fakeID from Redis via email with Postgres fallback
	exists, publicID := s.usersService.CheckEmail(ctx, email)
	if !exists || publicID == "" {
		return errors.New("no account found with that email address")
	}

	// 3. Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// 4. Update password in DB
	err = s.queries.UpdateUserPasswordByFid(ctx, queries.UpdateUserPasswordByFidParams{
		PublicID:     publicID,
		PasswordHash: string(hashedPassword),
	})
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// 4. Invalidate all active sessions across all devices
	// Security requirement: Changing/resetting a password must immediately revoke all existing
	// authentication tokens and sessions across all devices (desktops, mobile apps, browsers).
	//
	// Redis Key Hierarchy:
	//   1. User-to-Sessions Set   (`db.RedisUserLoginSessions` + fakeID):
	//      Stores the set of all active session IDs belonging to this user.
	//   2. Session-to-Tokens Set  (`db.RedisSessionTokens` + sessionID):
	//      Stores the set of active refresh token identifiers associated with each session.
	//   3. Refresh Token Payload  (`db.RedisJwtRefreshToken` + token):
	//      Stores the actual refresh token record used during token renewals.
	// first gets all the session ids, then loop through it to get all the refresh tokens
	// then delete the tokens and the session id
	userSessionsRedisKey := fmt.Sprintf("%s%s", db.RedisUserLoginSessions, publicID)
	sessions, err := s.rdb.SMembers(ctx, userSessionsRedisKey).Result()
	if err == nil && len(sessions) > 0 {
		// Use a transactional pipeline to execute all deletion commands in a single round-trip
		pipe := s.rdb.TxPipeline()

		// loop through all the session ids and delete the tokens
		for _, sessionID := range sessions {
			sessionTokensRedisKey := fmt.Sprintf("%s%s", db.RedisSessionTokens, sessionID)
			tokens, _ := s.rdb.SMembers(ctx, sessionTokensRedisKey).Result()

			// a) Revoke every refresh token under this session
			for _, token := range tokens {
				refreshTokenRedisKey := fmt.Sprintf("%s%s", db.RedisJwtRefreshToken, token)
				pipe.Del(ctx, refreshTokenRedisKey)
			}

			// b) Delete the session's token set
			pipe.Del(ctx, sessionTokensRedisKey)
		}

		// c) Delete the user's overall active session tracking set
		pipe.Del(ctx, userSessionsRedisKey)

		// Execute all queued Redis deletion commands atomically
		_, _ = pipe.Exec(ctx)
	}

	// 5. Update cached user info
	_ = s.usersService.InvalidateCachedUserInfo(ctx, publicID)

	return nil
}


// CheckAndAssignRole checks if a user already has a specific role, and if not, assigns it.
func (s *AuthService) CheckAndAssignRole(ctx context.Context, userID int64, publicID string, roleCode string, whoAssigned int64) error {
	// 1. Get user roles (with cache check)
	roles, err := s.usersService.GetUserRoles(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to fetch user roles: %w", err)
	}

	// 2. Check if the user already has the role
	for _, r := range roles.RolesCode {
		if r == roleCode {
			// Already has the role, no need to assign again
			return nil
		}
	}

	// 3. Assign the role in DB (UsersService handles caching)
	err = s.usersService.AssignUserRole(ctx, userID, publicID, roleCode, whoAssigned)
	if err != nil {
		return fmt.Errorf("failed to assign role %s: %w", roleCode, err)
	}

	return nil
}

// UpdateUserRoles replaces a user's roles and optionally sets their party ID.
func (s *AuthService) UpdateUserRoles(ctx context.Context, userID int64, publicID string, roles []string, partyID *int64, whoAssigned int64) error {
	// 1. Delete all existing roles
	err := s.queries.DeleteUserRoles(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to delete existing roles: %w", err)
	}

	// 2. Assign the new roles
	for _, roleCode := range roles {
		err = s.usersService.AssignUserRole(ctx, userID, publicID, roleCode, whoAssigned)
		if err != nil {
			return fmt.Errorf("failed to assign role %s: %w", roleCode, err)
		}
	}

	return nil
}

// ---------------------------------------------------------------------------
// Progressive Onboarding Methods
// ---------------------------------------------------------------------------

type StoredPhoneOTP struct {
	Hash     string `json:"hash"`
	Phone    string `json:"phone"`
	Attempts int    `json:"attempts"`
}

func (s *AuthService) phoneOtpKey(userID int64) string {
	return fmt.Sprintf("phone_otp:%d", userID)
}

func (s *AuthService) SendPhoneOTP(ctx context.Context, userID int64, phone, channel, iso2 string) error {
	phone = strings.TrimSpace(phone)
	if phone == "" {
		return errors.New("phone number is required")
	}
	if iso2 == "" {
		iso2 = "NG"
	}
	formattedPhone, err := utils.ValidatePhoneForCountry(phone, iso2)
	if err != nil {
		return err
	}

	// Check if already registered to another user
	if exists, existingPID := s.usersService.CheckPhone(ctx, formattedPhone, ""); exists {
		user, err := s.queries.GetUserByID(ctx, userID)
		if err != nil || user.PublicID != existingPID {
			return errors.New("phone number is already registered to another account")
		}
	}

	// Generate 6-digit numeric OTP
	n, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return fmt.Errorf("failed to generate otp: %w", err)
	}
	otp := fmt.Sprintf("%06d", n.Int64()+100000)

	hash, err := bcrypt.GenerateFromPassword([]byte(otp), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash otp: %w", err)
	}

	stored := StoredPhoneOTP{
		Hash:     string(hash),
		Phone:    formattedPhone,
		Attempts: 0,
	}
	raw, err := json.Marshal(stored)
	if err != nil {
		return err
	}

	key := s.phoneOtpKey(userID)
	if err := s.rdb.Set(ctx, key, string(raw), 10*time.Minute).Err(); err != nil {
		return fmt.Errorf("failed to cache otp: %w", err)
	}

	// Dispatch OTP
	if s.messagingService != nil {
		if channel == "whatsapp" {
			_ = s.messagingService.SendWhatsAppOTP(formattedPhone, otp)
		} else {
			_ = s.messagingService.SendSmsOTP(formattedPhone, otp)
		}
	} else {
		slog.Info("DEV MODE: Phone OTP generated", "userID", userID, "phone", formattedPhone, "channel", channel, "otp", otp)
	}

	return nil
}

func (s *AuthService) VerifyPhoneOTP(ctx context.Context, userID int64, phone, otp, iso2 string) error {
	phone = strings.TrimSpace(phone)
	otp = strings.TrimSpace(otp)
	if phone == "" || otp == "" {
		return errors.New("phone and otp code are required")
	}
	if iso2 == "" {
		iso2 = "NG"
	}
	formattedPhone, err := utils.ValidatePhoneForCountry(phone, iso2)
	if err != nil {
		return err
	}

	key := s.phoneOtpKey(userID)
	raw, err := s.rdb.Get(ctx, key).Result()
	if err != nil {
		return errors.New("otp code expired or not found, please request a new code")
	}

	var stored StoredPhoneOTP
	if err := json.Unmarshal([]byte(raw), &stored); err != nil {
		return errors.New("invalid otp state")
	}

	if stored.Attempts >= maxOTPAttempts {
		_ = s.rdb.Del(ctx, key).Err()
		return errors.New("too many failed attempts, please request a new code")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(stored.Hash), []byte(otp)); err != nil {
		stored.Attempts++
		ttl := s.rdb.TTL(ctx, key).Val()
		if ttl > 0 {
			updatedRaw, _ := json.Marshal(stored)
			_ = s.rdb.Set(ctx, key, string(updatedRaw), ttl).Err()
		}
		return errors.New("invalid verification code")
	}

	_ = s.rdb.Del(ctx, key).Err()

	// Update phone & verified status in database
	if s.pool != nil {
		_, err := s.pool.Exec(ctx, `
			UPDATE users
			SET phone = $1, is_phone_verified = true, updated_at = NOW()
			WHERE id = $2
		`, formattedPhone, userID)
		if err != nil {
			return fmt.Errorf("failed to save verified phone number: %w", err)
		}
	}

	return nil
}

type OnboardingProfileParams struct {
	PublicID       string `json:"-"` // internal; not exposed to JSON
	FirstName      string `json:"first_name"`
	MiddleName     string `json:"middle_name"`
	LastName       string `json:"last_name"`
	DateOfBirth    string `json:"date_of_birth"`
	CurrentCountry int16  `json:"current_country"`
	CurrentState   string `json:"current_state"`
	CurrentCity    string `json:"current_city"`
	StreetAddress  string `json:"street_address"`
	PostalCode     string `json:"postal_code"`
	ReferralSource string `json:"referral_source"`
	ReferralCode   string `json:"referral_code"`
}

func (s *AuthService) UpdateOnboardingProfile(ctx context.Context, userID int64, p OnboardingProfileParams) error {
	p.FirstName = strings.TrimSpace(p.FirstName)
	p.LastName = strings.TrimSpace(p.LastName)
	if p.FirstName == "" || p.LastName == "" {
		return errors.New("first name and last name are required")
	}

	var dobVal interface{} = nil
	if p.DateOfBirth != "" {
		formats := []string{
			"2006-01-02",
			"02/01/2006",
			"01/02/2006",
			time.RFC3339,
			"2006-01-02T15:04:05Z07:00",
		}
		for _, layout := range formats {
			if dob, err := time.Parse(layout, p.DateOfBirth); err == nil {
				dobVal = dob
				break
			}
		}
	}

	refCode, _ := s.usersService.GenerateUniqueReferralCode(ctx, p.FirstName)

	if s.pool != nil {
		if refCode != "" {
			_, _ = s.pool.Exec(ctx, `
				UPDATE users
				SET referral_code = COALESCE(referral_code, $1),
				    updated_at = NOW()
				WHERE id = $2
			`, refCode, userID)
		}

		// Update jurisdiction on users table if provided
		if p.CurrentCountry > 0 {
			var iso2 string = "NG"
			_ = s.pool.QueryRow(ctx, "SELECT UPPER(iso2) FROM c_countries WHERE id = $1 LIMIT 1", p.CurrentCountry).Scan(&iso2)
			_, _ = s.pool.Exec(ctx, `
				UPDATE users
				SET current_country = $1,
				    country_code = $2,
				    nationality = COALESCE(NULLIF(nationality, ''), $2),
				    updated_at = NOW()
				WHERE id = $3
			`, p.CurrentCountry, iso2, userID)
		}

		// Sync to decoupled user_profiles table
		_, err := s.pool.Exec(ctx, `
			INSERT INTO user_profiles (user_id, first_name, last_name, middle_name, date_of_birth, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW())
			ON CONFLICT (user_id) DO UPDATE
			SET first_name = EXCLUDED.first_name,
			    last_name = EXCLUDED.last_name,
			    middle_name = EXCLUDED.middle_name,
			    date_of_birth = COALESCE(EXCLUDED.date_of_birth, user_profiles.date_of_birth),
			    updated_at = NOW()
		`, userID, p.FirstName, p.LastName, p.MiddleName, dobVal)
		if err != nil {
			return fmt.Errorf("failed to update profile: %w", err)
		}

		// Sync to normalized addresses table if provided
		if p.StreetAddress != "" || p.CurrentCity != "" {
			line1 := p.StreetAddress
			if line1 == "" {
				line1 = "Residential Address"
			}
			city := p.CurrentCity
			if city == "" {
				city = "Lagos"
			}
			countryCode := "NG"
			if p.CurrentCountry > 0 {
				_ = s.pool.QueryRow(ctx, "SELECT UPPER(iso2) FROM c_countries WHERE id = $1 LIMIT 1", p.CurrentCountry).Scan(&countryCode)
			}
			_, _ = s.pool.Exec(ctx, `
				INSERT INTO addresses (user_id, address_type, line_1, city, state, postal_code, country_code, is_current, updated_at)
				VALUES ($1, 'residential', $2, $3, $4, $5, $6, true, NOW())
			`, userID, line1, city, p.CurrentState, p.PostalCode, countryCode)
		}

		// If referral code provided in profile, link referrer
		if p.ReferralCode != "" {
			var referrerID int64
			err := s.pool.QueryRow(ctx, "SELECT id FROM users WHERE UPPER(referral_code) = UPPER($1) AND id <> $2 LIMIT 1", p.ReferralCode, userID).Scan(&referrerID)
			if err == nil && referrerID > 0 {
				_, _ = s.pool.Exec(ctx, `
					INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, milestone, status)
					VALUES ($1, $2, $3, 'completed', 'active')
					ON CONFLICT (referred_user_id) DO UPDATE SET status = 'active', updated_at = NOW()
				`, referrerID, userID, p.ReferralCode)
			}
		}

		// Activate account status
		_, _ = s.pool.Exec(ctx, `
			UPDATE users
			SET account_status = 'active', updated_at = NOW()
			WHERE id = $1
		`, userID)

		// Determine user currency
		var userCountryCode string
		_ = s.pool.QueryRow(ctx, "SELECT COALESCE(country_code, 'NG') FROM users WHERE id = $1", userID).Scan(&userCountryCode)
		userCurrency := "NGN"
		switch userCountryCode {
		case "GH":
			userCurrency = "GHS"
		case "KE":
			userCurrency = "KES"
		case "ZA":
			userCurrency = "ZAR"
		case "US":
			userCurrency = "USD"
		case "GB":
			userCurrency = "GBP"
		case "EU":
			userCurrency = "EUR"
		}

		// Provision initial financial_account if not yet existing
		var finAccCount int64
		_ = s.pool.QueryRow(ctx, "SELECT COUNT(*) FROM financial_accounts WHERE user_id = $1", userID).Scan(&finAccCount)
		if finAccCount == 0 {
			facPublicID := crypto.GeneratePublicID("fac")
			_, _ = s.pool.Exec(ctx, `
				INSERT INTO financial_accounts (public_id, user_id, currency, asset_type, available_balance_minor, ledger_balance_minor, status)
				VALUES ($1, $2, $3, 'fiat', 0, 0, 'active')
				ON CONFLICT (user_id, currency, asset_type, asset_network) DO NOTHING
			`, facPublicID, userID, userCurrency)
		}

		// Provision legacy wallet if not yet existing
		var walletCount int64
		_ = s.pool.QueryRow(ctx, "SELECT COUNT(*) FROM wallets WHERE user_id = $1", userID).Scan(&walletCount)
		if walletCount == 0 {
			ref := fmt.Sprintf("WLT-NGN-%d-%d", userID, time.Now().Unix())
			_, _ = s.pool.Exec(ctx, `
				INSERT INTO wallets (user_id, account_reference, account_name, currency, balance_kobo, status)
				VALUES ($1, $2, $3, 'NGN', 0, 'active')
				ON CONFLICT (account_reference) DO NOTHING
			`, userID, ref, p.FirstName)
		}
	}

	// Invalidate the Redis user-info cache so GetMe returns fresh data.
	if p.PublicID != "" {
		_ = s.usersService.InvalidateCachedUserInfo(ctx, p.PublicID)
	}

	return nil
}

func (s *AuthService) CompleteOnboardingAndActivate(ctx context.Context, userID int64, referralCode string) error {
	if s.pool != nil {
		var firstName, pinHash, userCurrency string
		var countryCode string
		err := s.pool.QueryRow(ctx, `
			SELECT COALESCE(up.first_name, ''), COALESCE(u.pin_hash, ''), COALESCE(u.country_code, 'NG')
			FROM users u
			LEFT JOIN user_profiles up ON up.user_id = u.id
			WHERE u.id = $1
		`, userID).Scan(&firstName, &pinHash, &countryCode)
		if err != nil {
			return fmt.Errorf("user not found: %w", err)
		}

		if firstName == "" {
			return errors.New("please complete your personal details first")
		}

		userCurrency = "NGN"
		switch countryCode {
		case "GH":
			userCurrency = "GHS"
		case "KE":
			userCurrency = "KES"
		case "ZA":
			userCurrency = "ZAR"
		case "US":
			userCurrency = "USD"
		case "GB":
			userCurrency = "GBP"
		case "EU":
			userCurrency = "EUR"
		}

		// Activate account status
		_, err = s.pool.Exec(ctx, `
			UPDATE users
			SET account_status = 'active', updated_at = NOW()
			WHERE id = $1
		`, userID)
		if err != nil {
			return fmt.Errorf("failed to activate account: %w", err)
		}

		// If referral code provided, link referral
		if referralCode != "" {
			var referrerID int64
			err := s.pool.QueryRow(ctx, "SELECT id FROM users WHERE UPPER(referral_code) = UPPER($1) AND id <> $2 LIMIT 1", referralCode, userID).Scan(&referrerID)
			if err == nil && referrerID > 0 {
				_, _ = s.pool.Exec(ctx, `
					INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, milestone, status)
					VALUES ($1, $2, $3, 'completed', 'active')
					ON CONFLICT (referred_user_id) DO UPDATE SET status = 'active', updated_at = NOW()
				`, referrerID, userID, referralCode)
			}
		}

		// Provision initial financial_account if not yet existing
		var finAccCount int64
		_ = s.pool.QueryRow(ctx, "SELECT COUNT(*) FROM financial_accounts WHERE user_id = $1", userID).Scan(&finAccCount)
		if finAccCount == 0 {
			facPublicID := crypto.GeneratePublicID("fac")
			_, _ = s.pool.Exec(ctx, `
				INSERT INTO financial_accounts (public_id, user_id, currency, asset_type, available_balance_minor, ledger_balance_minor, status)
				VALUES ($1, $2, $3, 'fiat', 0, 0, 'active')
				ON CONFLICT (user_id, currency, asset_type, asset_network) DO NOTHING
			`, facPublicID, userID, userCurrency)
		}

		// Provision legacy wallet if not yet existing
		var walletCount int64
		_ = s.pool.QueryRow(ctx, "SELECT COUNT(*) FROM wallets WHERE user_id = $1", userID).Scan(&walletCount)
		if walletCount == 0 {
			ref := fmt.Sprintf("WLT-NGN-%d-%d", userID, time.Now().Unix())
			_, _ = s.pool.Exec(ctx, `
				INSERT INTO wallets (user_id, account_reference, account_name, currency, balance_kobo, status)
				VALUES ($1, $2, $3, 'NGN', 0, 'active')
				ON CONFLICT (account_reference) DO NOTHING
			`, userID, ref, firstName)
		}
	}

	return nil
}

// RegisterDevice records or updates a device fingerprint for user security and anti-takeover
func (s *AuthService) RegisterDevice(ctx context.Context, userID int64, fingerprint, platform, deviceName string) error {
	if s.pool == nil || fingerprint == "" {
		return nil
	}
	hash := sha256.Sum256([]byte(fingerprint))
	hashHex := hex.EncodeToString(hash[:])

	validPlatform := "unknown"
	switch strings.ToLower(platform) {
	case "ios":
		validPlatform = "ios"
	case "android":
		validPlatform = "android"
	case "web":
		validPlatform = "web"
	}

	_, err := s.pool.Exec(ctx, `
		INSERT INTO devices (user_id, device_fingerprint_hash, platform, device_name, last_seen_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (user_id, device_fingerprint_hash) DO UPDATE
		SET last_seen_at = NOW(),
		    device_name = COALESCE(NULLIF(EXCLUDED.device_name, ''), devices.device_name)
	`, userID, hashHex, validPlatform, deviceName)
	return err
}

