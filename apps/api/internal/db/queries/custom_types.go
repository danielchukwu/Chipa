package queries

import "encoding/json"

// UserWithPlaces extends the base User struct with additional resolved fields
// like location names, verifications, and roles.
type UserWithPlaces struct {
	GetUserByFakeIDRow
	CountryName string          `json:"country_name"`
	StateName   string          `json:"state_name"`
	CityName    string          `json:"city_name"`
	Roles       CachedUserRoles `json:"roles"`
}

// CachedUserRoles holds both full role records and just their codes for efficient access
type CachedUserRoles struct {
	Roles     []GetUserRolesRow `json:"roles"`
	RolesCode []string          `json:"roles_code"`
}

// jsonUsersPhoneNumber is an alias used exclusively inside MarshalJSON to avoid infinite recursion.
type jsonUsersPhoneNumber UsersPhoneNumber

func (up UsersPhoneNumber) MarshalJSON() ([]byte, error) {
	type Alias jsonUsersPhoneNumber
	whatsappStr := "no"
	if up.OnWhatsapp.Valid && up.OnWhatsapp.Bool {
		whatsappStr = "yes"
	}
	type PhoneOut struct {
		Alias
		OnWhatsapp string `json:"on_whatsapp"`
	}
	return json.Marshal(PhoneOut{
		Alias:      Alias(jsonUsersPhoneNumber(up)),
		OnWhatsapp: whatsappStr,
	})
}
