package usersservice

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"chipa/api/internal/db"
	"chipa/api/internal/db/queries"
	"chipa/api/internal/domain"
	paystackprovider "chipa/api/internal/provider/paystack"
	"math/big"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/redis/go-redis/v9"
	"golang.org/x/sync/errgroup"
)

// UsersService provides operations for managing user data, roles, and related services.
type UsersService struct {
	queries        *queries.Queries
	rdb            *redis.Client
	paystackClient *paystackprovider.PaystackClient
}

// CachedReferralCodeInfo represents the cached referrer details stored in Redis.
type CachedReferralCodeInfo struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

// NewUsersService initializes and returns a new UsersService.
func NewUsersService(q *queries.Queries, rdb *redis.Client, paystackClient *paystackprovider.PaystackClient) *UsersService {
	return &UsersService{
		queries:        q,
		rdb:            rdb,
		paystackClient: paystackClient,
	}
}

// GetBanks retrieves a list of available banks via Paystack.
func (s *UsersService) GetBanks(ctx context.Context) ([]domain.Bank, error) {
	if s.paystackClient == nil {
		return nil, fmt.Errorf("paystack client is not configured")
	}
	return s.paystackClient.GetBanks(ctx)
}

// ValidateBankAccount checks if a given account number and bank code are valid via Paystack.
func (s *UsersService) ValidateBankAccount(ctx context.Context, accountNumber string, bankCode string) (string, error) {
	if s.paystackClient == nil {
		return "", fmt.Errorf("paystack client is not configured")
	}
	return s.paystackClient.ValidateBankAccount(ctx, accountNumber, bankCode)
}

// GetUserByPublicID retrieves a user's details including their location names (Country, State, City).
// It implements a cache-aside pattern using Redis to improve performance.
func (s *UsersService) GetUserByPublicID(ctx context.Context, publicID string) (queries.UserWithPlaces, error) {
	// Check Redis cache first
	userInfoKey := fmt.Sprintf("%s%s", db.RedisUserInfo, publicID)
	userInfoJSON, err := s.rdb.Get(ctx, userInfoKey).Result()
	if err == nil {
		var user queries.UserWithPlaces
		if err := json.Unmarshal([]byte(userInfoJSON), &user); err == nil {
			return user, nil
		}
	}

	// Fetch user info from DB
	user, err := s.queries.GetUserByPublicID(ctx, publicID)
	if err != nil {
		return queries.UserWithPlaces{}, fmt.Errorf("user not found: %w", err)
	}

	// fetch the user roles
	var roles queries.CachedUserRoles
	if user.HasRole.Valid && user.HasRole.Bool {
		if r, err := s.GetUserRoles(ctx, user.ID); err == nil {
			roles = r
		}
	}

	countryName, stateName, cityName := "", "", ""

	// Create a copy of the user and obscure sensitive fields for caching
	userForCache := user
	userForCache.PasswordHash = "---"
	userForCache.VotersCardImage.String = "---"
	userForCache.Phone.String = "---"
	userForCache.Email.String = "---"

	// Cache it in Redis
	userWithPlacesForCache := queries.UserWithPlaces{
		GetUserByFakeIDRow: userForCache,
		CountryName:        countryName,
		StateName:          stateName,
		CityName:           cityName,
		Roles:              roles,
	}

	// cache the user data in redis
	userJSON, err := json.Marshal(userWithPlacesForCache)
	if err == nil {
		s.rdb.Set(ctx, userInfoKey, userJSON, db.RedisFiveYearsTTL) // 5 years expires
	}

	return userWithPlacesForCache, nil
}

func (s *UsersService) GetUserByFakeID(ctx context.Context, publicID string) (queries.UserWithPlaces, error) {
	return s.GetUserByPublicID(ctx, publicID)
}

// GetUsersByPublicIDs retrieves multiple users optimally.
func (s *UsersService) GetUsersByPublicIDs(ctx context.Context, publicIDs []string) ([]queries.UserWithPlaces, error) {
	if len(publicIDs) == 0 {
		return []queries.UserWithPlaces{}, nil
	}

	// put the keys of the users in a slice
	keys := make([]string, len(publicIDs))
	for i, id := range publicIDs {
		keys[i] = fmt.Sprintf("%s%s", db.RedisUserInfo, id)
	}

	// Fetch from Redis via MGET
	cachedUsers, err := s.rdb.MGet(ctx, keys...).Result()
	if err != nil && err != redis.Nil {
		return nil, fmt.Errorf("failed to mget users from redis: %w", err)
	}

	results := make([]queries.UserWithPlaces, len(publicIDs))
	var missedIndices []int

	for i, cachedUser := range cachedUsers {
		if cachedUser != nil {
			userValue, ok := cachedUser.(string)
			if ok {
				var user queries.UserWithPlaces
				if err := json.Unmarshal([]byte(userValue), &user); err == nil {
					results[i] = user
					continue
				}
			}
		}
		missedIndices = append(missedIndices, i)
	}

	if len(missedIndices) > 0 {
		var g errgroup.Group
		var mu sync.Mutex

		for _, idx := range missedIndices {
			pubID := publicIDs[idx]
			g.Go(func() error {
				user, err := s.GetUserByPublicID(ctx, pubID)
				if err != nil {
					return err
				}
				mu.Lock()
				results[idx] = user
				mu.Unlock()
				return nil
			})
		}

		if err := g.Wait(); err != nil {
			return nil, err
		}
	}

	return results, nil
}

func (s *UsersService) GetUsersByFakeIDs(ctx context.Context, publicIDs []string) ([]queries.UserWithPlaces, error) {
	return s.GetUsersByPublicIDs(ctx, publicIDs)
}

// InvalidateCachedUserInfo invalidates the cached user information in Redis.
// This function should be called anytime a user's details changes
func (s *UsersService) InvalidateCachedUserInfo(ctx context.Context, publicID string) error {
	userInfoKey := fmt.Sprintf("%s%s", db.RedisUserInfo, publicID)
	return s.rdb.Del(ctx, userInfoKey).Err()
}

// InvalidateCachedUserRoles invalidates the cached user roles in Redis.
// This function should be called anytime a user's roles change.
func (s *UsersService) InvalidateCachedUserRoles(ctx context.Context, userID int64) error {
	userRolesKey := fmt.Sprintf("%s%d", db.RedisUserRoles, userID)
	return s.rdb.Del(ctx, userRolesKey).Err()
}

// GetUserRoles fetches the roles assigned to a specific user, utilizing Redis caching.
func (s *UsersService) GetUserRoles(ctx context.Context, userID int64) (queries.CachedUserRoles, error) {
	userRolesKey := fmt.Sprintf("%s%d", db.RedisUserRoles, userID)

	// first redis to see if the roles have been cached
	rolesJSON, err := s.rdb.Get(ctx, userRolesKey).Result()
	if err == nil {
		var cachedRoles queries.CachedUserRoles
		if err := json.Unmarshal([]byte(rolesJSON), &cachedRoles); err == nil {
			return cachedRoles, nil
		}
	}

	// Fetch from DB if not in Redis
	roles, err := s.queries.GetUserRoles(ctx, userID)
	if err != nil {
		return queries.CachedUserRoles{}, err
	}

	var rolesCode []string
	for _, r := range roles {
		rolesCode = append(rolesCode, r.Code)
	}

	cachedRoles := queries.CachedUserRoles{
		Roles:     roles,
		RolesCode: rolesCode,
	}

	// Cache it in Redis
	rolesJSONBytes, err := json.Marshal(cachedRoles)
	if err == nil {
		s.rdb.Set(ctx, userRolesKey, rolesJSONBytes, db.RedisFiveYearsTTL) // expires in 5years
	}

	return cachedRoles, nil
}

// AssignUserRole assigns a specific role to a user and invalidates the user's role cache.
func (s *UsersService) AssignUserRole(ctx context.Context, userID int64, publicID string, code string, whoAssigned int64) error {
	role, err := s.queries.GetRoleByCode(ctx, code)
	if err != nil {
		return err
	}
	err = s.queries.AssignUserRole(ctx, queries.AssignUserRoleParams{
		UserID:            userID,
		RoleID:            role.ID,
		RoleCode:          role.Code,
		WhoAssignedUserID: whoAssigned,
	})
	if err != nil {
		return err
	}

	// Update the user_table, updates has_role to true
	_ = s.queries.UpdateUserHasRole(ctx, queries.UpdateUserHasRoleParams{
		ID:      userID,
		HasRole: pgtype.Bool{Bool: true, Valid: true},
	})

	_ = s.InvalidateCachedUserRoles(ctx, userID) // Invalidate the user-roles cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)  // Invalidate user info cache

	return nil
}

// RemoveUserRole removes a specific role from a user and updates has_role if needed.
func (s *UsersService) RemoveUserRole(ctx context.Context, userID int64, publicID string, code string) error {
	err := s.queries.RemoveUserRole(ctx, queries.RemoveUserRoleParams{
		UserID:   userID,
		RoleCode: code,
	})
	if err != nil {
		return err
	}

	// Check if user has any roles left
	hasRole, err := s.queries.CheckUserHasAnyRole(ctx, userID)
	if err != nil {
		return err
	}
	_ = s.queries.UpdateUserHasRole(ctx, queries.UpdateUserHasRoleParams{
		ID:      userID,
		HasRole: pgtype.Bool{Bool: hasRole, Valid: true},
	})

	_ = s.InvalidateCachedUserRoles(ctx, userID) // Invalidate the roles cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)  // Invalidate user info cache

	return nil
}

// UpdateUserProfile updates basic user profile details and invalidates the user info cache.
func (s *UsersService) UpdateUserProfile(ctx context.Context, id int64, publicID string, firstName, lastName, middleName, gender, avatar string, avatarFileId *int64, countryID, stateID int16, cityID int32) error {
	avatarFileIdPg := pgtype.Int8{Valid: false}
	if avatarFileId != nil {
		avatarFileIdPg = pgtype.Int8{Int64: *avatarFileId, Valid: true}
	}

	err := s.queries.UpdateUserProfile(ctx, queries.UpdateUserProfileParams{
		ID:             id,
		FirstName:      pgtype.Text{String: firstName, Valid: firstName != ""},
		LastName:       pgtype.Text{String: lastName, Valid: lastName != ""},
		MiddleName:     pgtype.Text{String: middleName, Valid: middleName != ""},
		Gender:         pgtype.Text{String: gender, Valid: gender != ""},
		Avatar:         pgtype.Text{String: avatar, Valid: avatar != ""},
		AvatarFileID:   avatarFileIdPg,
		CurrentCountry: countryID,
		CurrentState:   stateID,
		CurrentCity:    pgtype.Int4{Int32: cityID, Valid: cityID != 0},
	})
	if err != nil {
		return err
	}

	// Invalidate the cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)
	return nil
}

// ListUsers retrieves a paginated list of users based on provided parameters.
func (s *UsersService) ListUsers(ctx context.Context, arg queries.ListUsersParams) ([]queries.ListUsersRow, error) {
	return s.queries.ListUsers(ctx, arg)
}

// GetUserVerification fetches the verification status/details for a specific user.
func (s *UsersService) GetUserVerification(ctx context.Context, userID int64) (queries.UserVerification, error) {
	return s.queries.GetUserVerification(ctx, userID)
}

// DeleteUserAccount removes a user by ID and invalidates their user info cache.
func (s *UsersService) DeleteUserAccount(ctx context.Context, id int64, publicID string) error {
	err := s.queries.DeleteUser(ctx, id)
	if err != nil {
		return err
	}

	// Invalidate the cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)
	return nil
}

// GetMoreInfoAboutThisUser fetches extended profile details for a user, using Redis cache.
func (s *UsersService) GetMoreInfoAboutThisUser(ctx context.Context, userID int64) (queries.UserMoreInfo, error) {
	// Check Redis
	userProfileKey := fmt.Sprintf("%s%d", db.RedisUserMoreInfo, userID)
	profileJSON, err := s.rdb.Get(ctx, userProfileKey).Result()
	if err == nil {
		var profile queries.UserMoreInfo
		if err := json.Unmarshal([]byte(profileJSON), &profile); err == nil {
			return profile, nil
		}
	}

	// Fetch from DB if not in Redis
	profile, err := s.queries.GetMoreInfoAboutThisUser(ctx, userID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Return empty profile for new users instead of failing
			return queries.UserMoreInfo{UserID: userID}, nil
		}
		return queries.UserMoreInfo{}, fmt.Errorf("user profile not found: %w", err)
	}

	// Cache it in Redis
	profileJSONBytes, err := json.Marshal(profile)
	if err == nil {
		s.rdb.Set(ctx, userProfileKey, profileJSONBytes, db.RedisFiveYearsTTL)
	}

	return profile, nil
}



// AdminUpdateUser allows admins to perform a comprehensive update of user details.
func (s *UsersService) AdminUpdateUser(ctx context.Context, id int64, publicID string, firstName, lastName, middleName, username, gender, avatar string, avatarFileId *int64, countryID, stateID int16, cityID int32, stateOfOrigin int16) error {
	avatarFileIdPg := pgtype.Int8{Valid: false}
	if avatarFileId != nil {
		avatarFileIdPg = pgtype.Int8{Int64: *avatarFileId, Valid: true}
	}

	err := s.queries.AdminUpdateUser(ctx, queries.AdminUpdateUserParams{
		ID:             id,
		FirstName:      pgtype.Text{String: firstName, Valid: firstName != ""},
		LastName:       pgtype.Text{String: lastName, Valid: lastName != ""},
		MiddleName:     pgtype.Text{String: middleName, Valid: middleName != ""},
		Username:       pgtype.Text{String: username, Valid: username != ""},
		Gender:         pgtype.Text{String: gender, Valid: gender != ""},
		Avatar:         pgtype.Text{String: avatar, Valid: avatar != ""},
		AvatarFileID:   avatarFileIdPg,
		CurrentCountry: countryID,
		CurrentState:   stateID,
		CurrentCity:    pgtype.Int4{Int32: cityID, Valid: cityID != 0},
		StateOfOrigin:  pgtype.Int2{Int16: stateOfOrigin, Valid: stateOfOrigin != 0},
	})
	if err != nil {
		return err
	}

	// Invalidate the cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)
	return nil
}

// ResetUserAvatar clears the user's avatar and invalidates their cached user info.
func (s *UsersService) ResetUserAvatar(ctx context.Context, userID int64, publicID string) error {
	err := s.queries.UpdateUserAvatar(ctx, queries.UpdateUserAvatarParams{
		ID:           userID,
		Avatar:       pgtype.Text{Valid: false},
		AvatarFileID: pgtype.Int8{Valid: false},
	})
	if err != nil {
		return err
	}

	// invalidate the cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)
	return nil
}

// UpdateUserProfileDetails updates extended educational and demographic information for a user.
func (s *UsersService) UpdateUserProfileDetails(ctx context.Context, userID int64, occupationID *int16, educationalStatus, highestDegree, graduationYear, schoolName, religion, maritalStatus, educationLevel, address string) error {
	var pgOccupationID pgtype.Int2
	if occupationID != nil {
		pgOccupationID = pgtype.Int2{Int16: *occupationID, Valid: true}
	} else {
		pgOccupationID = pgtype.Int2{Valid: false}
	}

	err := s.queries.UpdateMoreInfoAboutThisUser(ctx, queries.UpdateMoreInfoAboutThisUserParams{
		UserID:            userID,
		OccupationID:      pgOccupationID,
		EducationalStatus: pgtype.Text{String: educationalStatus, Valid: educationalStatus != ""},
		HighestDegree:     pgtype.Text{String: highestDegree, Valid: highestDegree != ""},
		GraduationYear:    pgtype.Text{String: graduationYear, Valid: graduationYear != ""},
		SchoolName:        pgtype.Text{String: schoolName, Valid: schoolName != ""},
		Religion:          pgtype.Text{String: religion, Valid: religion != ""},
		MaritalStatus:     pgtype.Text{String: maritalStatus, Valid: maritalStatus != ""},
		Address:           pgtype.Text{String: address, Valid: address != ""},
	})
	if err != nil {
		return err
	}

	// Invalidate cache
	userProfileKey := fmt.Sprintf("%s%d", db.RedisUserMoreInfo, userID)
	s.rdb.Del(ctx, userProfileKey)
	return nil
}

// GetUserPhoneNumbersByUserID retrieves a user's phone numbers, prioritizing Redis cache.
func (s *UsersService) GetUserPhoneNumbersByUserID(ctx context.Context, userID int64) ([]queries.UsersPhoneNumber, error) {
	// Check Redis
	userPhoneNumbersKey := fmt.Sprintf("%s%d", db.RedisUserPhoneNumbers, userID)
	phoneNumbersJSON, err := s.rdb.Get(ctx, userPhoneNumbersKey).Result()
	if err == nil {
		var phoneNumbers []queries.UsersPhoneNumber
		if err := json.Unmarshal([]byte(phoneNumbersJSON), &phoneNumbers); err == nil {
			return phoneNumbers, nil
		}
	}

	// Fetch from DB if not in Redis
	phoneNumbers, err := s.queries.GetUserPhoneNumbersByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Cache it in Redis
	phoneNumbersJSONBytes, err := json.Marshal(phoneNumbers)
	if err == nil {
		s.rdb.Set(ctx, userPhoneNumbersKey, phoneNumbersJSONBytes, db.RedisFiveYearsTTL) // 5years TTL
	}

	return phoneNumbers, nil
}

// PhonePayload represents the incoming data structure for updating phone numbers.
type PhonePayload struct {
	ID         int64  `json:"id"`
	Phone      string `json:"phone"`
	Phonecode  string `json:"phonecode"`
	RawInput   string `json:"raw_input"`
	OnWhatsapp string `json:"on_whatsapp"`
	IsDefault  bool   `json:"is_default"`
}

// UpdateUserPhoneNumbers creates or updates multiple phone numbers for a user.
func (s *UsersService) UpdateUserPhoneNumbers(ctx context.Context, userID int64, publicID string, phones []PhonePayload) error {
	// Count how many new phone numbers (where ID is 0) the user is attempting to add
	// and ensure no more than 1 phone number is set as default
	newPhonesCount := 0
	defaultPhonesCount := 0

	for _, p := range phones {
		if p.IsDefault {
			defaultPhonesCount++
		}
		if p.ID == 0 {
			// checks if the phone-number already exists for another user
			if exists, _ := s.CheckPhone(ctx, p.Phone, publicID); exists {
				return fmt.Errorf("phone number already exists")
			}
			newPhonesCount++
		}

	}

	if defaultPhonesCount <= 0 {
		return fmt.Errorf("at least one phone number must be set as default")
	}
	if defaultPhonesCount > 1 {
		return fmt.Errorf("only one phone number can be set as default")
	}

	// If there are new phone numbers, ensure that adding them doesn't exceed the max limit of 5
	if newPhonesCount > 0 {
		// Fetch the total count of both active and inactive phone numbers for this user
		currentCount, err := s.queries.CountAllUserPhoneNumbers(ctx, userID)
		if err != nil {
			return fmt.Errorf("failed to check current phone numbers: %w", err)
		}

		// Reject the request if the total would exceed the 5 phone number limit
		if int(currentCount)+newPhonesCount > 5 {
			return fmt.Errorf("maximum of 5 phone numbers reached, if you'd like to add more, please contact the customer support")
		}
	}

	// Update or create phone numbers
	for _, p := range phones {
		whatsappVal := false
		if p.OnWhatsapp == "yes" {
			whatsappVal = true
		}
		onWhatsapp := pgtype.Bool{Bool: whatsappVal, Valid: true}
		isDefault := pgtype.Bool{Bool: p.IsDefault, Valid: true}

		// if p.ID == 0, it means the phone number is new, so create it
		if p.ID == 0 {
			if p.Phone == "" {
				return fmt.Errorf("phone number cannot be empty")
			}

			// create the phone-number in the postgres db
			_, err := s.queries.CreatePhoneNumber(ctx, queries.CreatePhoneNumberParams{
				UserID:     userID,
				Phone:      p.Phone, // Should be fully formatted E.164
				Phonecode:  p.Phonecode,
				RawInput:   p.RawInput,
				OnWhatsapp: onWhatsapp,
				IsDefault:  isDefault,
			})
			if err != nil {
				return err
			}

			// Cache the new phone number to publicID mapping
			err = s.rdb.Set(ctx, db.RedisPhoneFakeID+p.Phone, publicID, 0).Err()
			if err != nil {
				return err
			}
		} else {
			// update the user's phone-number in the postgres db
			err := s.queries.UpdatePhoneNumber(ctx, queries.UpdatePhoneNumberParams{
				ID:         p.ID,
				UserID:     userID,
				OnWhatsapp: onWhatsapp,
				IsDefault:  isDefault,
			})
			if err != nil {
				return err
			}
		}
	}

	// Invalidate the active cached user phone-numbers
	userPhoneNumbersKey := fmt.Sprintf("%s%d", db.RedisUserPhoneNumbers, userID)
	s.rdb.Del(ctx, userPhoneNumbersKey)

	return nil
}

// DeleteUserPhoneNumber removes a specific phone number record by its ID.
func (s *UsersService) DeleteUserPhoneNumber(ctx context.Context, id int64, userID int64) error {
	err := s.queries.DeleteUserPhoneNumber(ctx, queries.DeleteUserPhoneNumberParams{
		ID:     id,
		UserID: userID,
	})
	if err != nil {
		return err
	}

	// Invalidate the active cached user phone-numbers
	userPhoneNumbersKey := fmt.Sprintf("%s%d", db.RedisUserPhoneNumbers, userID)
	s.rdb.Del(ctx, userPhoneNumbersKey)

	return nil
}

// UpdateUserIsVerified updates the verified status of a user and invalidates their cache.
func (s *UsersService) UpdateUserIsVerified(ctx context.Context, userID int64, publicID string, isVerified bool) error {
	// Invalidate the user info cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)
	return nil
}

// UpdateUserParty updates the party_id of a user and invalidates their cache (no-op in fintech mode).
func (s *UsersService) UpdateUserParty(ctx context.Context, userID int64, partyID *int16, publicID string) error {
	// Invalidate the user info cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)
	return nil
}

// MakeUserSuperAdmin promotes a specific user to the superadmin role.
func (s *UsersService) MakeUserSuperAdmin(ctx context.Context, username string) error {
	allowed := map[string]bool{
		"stanley": true, "stanley_chukwu": true, "stanleychukwu": true,
		"daniel": true, "daniel_chukwu": true, "danielchukwu": true,
	}

	if !allowed[username] {
		return fmt.Errorf("username not authorized for superadmin promotion")
	}

	// Fetch public_id from DB directly
	publicID, err := s.queries.GetPublicIDByUsername(ctx, pgtype.Text{String: username, Valid: true})
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	user, err := s.GetUserByFakeID(ctx, publicID)
	if err != nil {
		return fmt.Errorf("failed to fetch user details: %w", err)
	}

	// 1. Get user roles
	rolesData, err := s.GetUserRoles(ctx, user.ID)
	if err != nil {
		return fmt.Errorf("failed to fetch user roles: %w", err)
	}

	// 2. Check if the user already has the super_admin role
	for _, r := range rolesData.RolesCode {
		if r == "super_admin" {
			// Already has the role, no need to assign again
			return nil
		}
	}

	// 3. Assign the role in DB
	err = s.AssignUserRole(ctx, user.ID, publicID, "super_admin", 0)
	if err != nil {
		return fmt.Errorf("failed to assign super_admin role: %w", err)
	}

	return nil
}

// UpdateUserRoles replaces a user's roles and optionally sets their party ID.
func (s *UsersService) UpdateUserRoles(ctx context.Context, userID int64, publicID string, roles []string, partyID *int64, whoAssigned int64) error {
	// Get existing roles
	currentRolesData, err := s.GetUserRoles(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to fetch current roles: %w", err)
	}

	// Create a map of current roles for quick lookup
	currentRolesMap := make(map[string]bool)
	for _, rCode := range currentRolesData.RolesCode {
		currentRolesMap[rCode] = true
	}

	// Create a map of new roles for quick lookup
	newRolesMap := make(map[string]bool)
	for _, roleCode := range roles {
		newRolesMap[roleCode] = true
	}

	// Identify and assign roles to ADD
	for roleCode := range newRolesMap {
		if !currentRolesMap[roleCode] {
			err = s.AssignUserRole(ctx, userID, publicID, roleCode, whoAssigned)
			if err != nil {
				return fmt.Errorf("failed to add role %s: %w", roleCode, err)
			}
		}
	}

	// 3. Identify and remove roles to DELETE
	for roleCode := range currentRolesMap {
		if !newRolesMap[roleCode] {
			err = s.RemoveUserRole(ctx, userID, publicID, roleCode)
			if err != nil {
				return fmt.Errorf("failed to remove role %s: %w", roleCode, err)
			}
		}
	}

	// invalidate the user cache here
	_ = s.InvalidateCachedUserInfo(ctx, publicID)

	return nil
}

// function: check if the username already exist in redis and in the postgres db
func (s *UsersService) CheckUsername(ctx context.Context, username string) (bool, string) {
	cacheKey := db.RedisUsernameFakeID + username

	// checks the cache first
	cachedVal, err := s.rdb.Get(ctx, cacheKey).Result()
	if err == nil && cachedVal != "" {
		return true, cachedVal
	}

	// checks the users table
	publicID, err := s.queries.GetPublicIDByUsername(ctx, pgtype.Text{String: username, Valid: true})
	if err == nil && publicID != "" {
		s.rdb.Set(ctx, cacheKey, publicID, db.RedisFiveYearsTTL)
		return true, publicID
	}

	return false, ""
}

// InvalidateUsernameCache deletes a specific username from Redis
func (s *UsersService) InvalidateUsernameCache(ctx context.Context, username string) {
	cacheKey := db.RedisUsernameFakeID + username
	s.rdb.Del(ctx, cacheKey)
}

// function: checks if the email already exists in redis and in the postgres db
func (s *UsersService) CheckEmail(ctx context.Context, email string) (bool, string) {
	cacheKey := db.RedisEmailFakeID + email

	// checks the cache first
	cachedVal, err := s.rdb.Get(ctx, cacheKey).Result()
	if err == nil && cachedVal != "" {
		return true, cachedVal
	}

	// checks the users table
	publicID, err := s.queries.GetPublicIDByEmail(ctx, pgtype.Text{String: email, Valid: true})
	if err == nil && publicID != "" {
		s.rdb.Set(ctx, cacheKey, publicID, db.RedisFiveYearsTTL)
		return true, publicID
	}

	return false, ""
}

// function: checks if the phone exists in redis and in the postgres db
func (s *UsersService) CheckPhone(ctx context.Context, phone string, userPublicID string) (bool, string) {
	cacheKey := db.RedisPhoneFakeID + phone

	// checks the cache first
	cachedVal, err := s.rdb.Get(ctx, cacheKey).Result()
	if err == nil && cachedVal != "" {
		if userPublicID != "" && cachedVal == userPublicID {
			// cached phone belongs to the current user, not a collision
		} else {
			return true, cachedVal
		}
	}

	// checks the users table
	publicID, err := s.queries.GetPublicIDByPhone(ctx, pgtype.Text{String: phone, Valid: true})
	if err == nil && publicID != "" {
		s.rdb.Set(ctx, cacheKey, publicID, db.RedisFiveYearsTTL)
		if userPublicID == "" || publicID != userPublicID {
			return true, publicID
		}
	}

	// fallback: check the users_phone_numbers table
	publicID, err = s.queries.GetPublicIDByAdditionalPhone(ctx, phone)
	if err == nil && publicID != "" {
		s.rdb.Set(ctx, cacheKey, publicID, db.RedisFiveYearsTTL)
		if userPublicID == "" || publicID != userPublicID {
			return true, publicID
		}
	}

	return false, ""
}


// CheckNIN function checks if the nin already exists in the database
func (s *UsersService) CheckNIN(ctx context.Context, nin string) bool {
	cacheKey := db.RedisUserNINQuickSearch + nin

	// checks the cache first
	exists, _ := s.rdb.Exists(ctx, cacheKey).Result()
	if exists > 0 {
		return true
	}

	// checks the users table
	userID, err := s.queries.GetUserIDByNIN(ctx, nin)
	if err == nil && userID > 0 {
		s.rdb.Set(ctx, cacheKey, userID, db.RedisFifteenMinutesTTL)
		return true
	}

	return false
}

// GetReferralCodeInfo retrieves referral code details from Redis or DB.
func (s *UsersService) GetReferralCodeInfo(ctx context.Context, code string) (*CachedReferralCodeInfo, error) {
	cacheKey := db.RedisReferralCode + code
	var info CachedReferralCodeInfo

	// Check Redis cache first
	cachedData, err := s.rdb.Get(ctx, cacheKey).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return &CachedReferralCodeInfo{}, nil
		}
		return nil, err
	}
	if cachedData != "" {
		err = json.Unmarshal([]byte(cachedData), &info)
		if err != nil {
			return nil, err
		}
		if info.ID > 0 {
			return &info, nil
		}
	}

	// Fetch from database if cache miss
	user, err := s.queries.GetReferrerNameByCode(ctx, pgtype.Text{String: code, Valid: true})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &CachedReferralCodeInfo{}, nil // Not taken
		}
		return nil, err
	}

	// Caches the result and formats it
	return s.cacheReferralCodeInfo(ctx, code, user.ID, user.FirstName.String, user.LastName.String), nil
}

// cacheReferralCodeInfo helper function to format and cache referral code details in Redis
func (s *UsersService) cacheReferralCodeInfo(ctx context.Context, code string, userID int64, firstName, lastName string) *CachedReferralCodeInfo {
	name := strings.TrimSpace(fmt.Sprintf("%s %s", firstName, lastName))
	info := CachedReferralCodeInfo{
		ID:   userID,
		Name: name,
	}

	if data, err := json.Marshal(info); err == nil {
		cacheKey := db.RedisReferralCode + code
		s.rdb.Set(ctx, cacheKey, string(data), db.RedisFiveYearsTTL)
	}
	return &info
}

// IsReferralCodeTaken checks if a referral code already exists in the database, using Redis for caching.
func (s *UsersService) IsReferralCodeTaken(ctx context.Context, code string) (bool, error) {
	info, err := s.GetReferralCodeInfo(ctx, code)
	if err != nil {
		return false, err
	}
	return info != nil, nil
}

// GenerateUniqueReferralCode generates a unique referral code based on the user's first name.
// Format: {FIRST_NAME}{3-digit random/sequential suffix} e.g. "DANIEL402"
func (s *UsersService) GenerateUniqueReferralCode(ctx context.Context, firstName string) (string, error) {
	firstName = strings.TrimSpace(firstName)

	// Clean string to alphanumeric characters only
	var clean strings.Builder
	for _, r := range firstName {
		// In Go, characters (runes) are represented by their Unicode/ASCII integer values.
		// This means we can compare them directly using math operators like >= and <=.
		// For example, 'a' is 97 and 'z' is 122. Checking (r >= 'a' && r <= 'z')
		// efficiently verifies if the character is a lowercase letter.
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			clean.WriteRune(r)
		}
	}

	// Convert the cleaned string to uppercase
	base := strings.ToUpper(clean.String())

	// If the cleaned string is empty (e.g., the original name was empty or contained only symbols),
	// use "AGENT" as the base for the referral code.
	if base == "" {
		base = "AGENT"
	}

	// Generate a random 3-digit suffix (100-999) for the referral code.
	n, _ := rand.Int(rand.Reader, big.NewInt(900))
	startOffset := int(n.Int64()) + 100

	// Try random 3-digit suffix first for entropy, fallback sequentially if collisions
	for i := range 900 {
		suffix := ((startOffset + i - 100) % 900) + 100
		code := fmt.Sprintf("%s%d", base, suffix)
		exists, err := s.IsReferralCodeTaken(ctx, code)
		if err != nil {
			return "", err
		}
		if !exists {
			return code, nil
		}
	}

	// Fallback to timestamp suffix if 3-digit combinations are exhausted
	timeSuffix := time.Now().UnixNano() % 1000000
	return fmt.Sprintf("%s%d", base, timeSuffix), nil
}

// GenerateAndAssignReferralCode generates and assigns a referral code to a user.
func (s *UsersService) GenerateAndAssignReferralCode(ctx context.Context, userID int64, publicID string, firstName string) (string, error) {
	user, err := s.GetUserByFakeID(ctx, publicID)
	if err != nil {
		return "", err
	}
	if user.ReferralCode.Valid && user.ReferralCode.String != "" {
		return user.ReferralCode.String, nil
	}

	code, err := s.GenerateUniqueReferralCode(ctx, firstName)
	if err != nil {
		return "", err
	}

	err = s.queries.UpdateUserReferralCode(ctx, queries.UpdateUserReferralCodeParams{
		ID:           userID,
		ReferralCode: pgtype.Text{String: code, Valid: true},
	})
	if err != nil {
		return "", err
	}

	// Cache the newly assigned referral code with user info in Redis
	s.cacheReferralCodeInfo(ctx, code, userID, user.FirstName.String, user.LastName.String)

	// Invalidate the cache
	_ = s.InvalidateCachedUserInfo(ctx, publicID)
	return code, nil
}
