package authservice_test

import (
	"testing"

	authservice "chipa/api/internal/service/auth"
)

func TestCleanUsername(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
		wantErr  bool
	}{
		{"valid username", "JohnDoe", "johndoe", false},
		{"valid with dot", "john.doe", "john.doe", false},
		{"valid with underscore", "john_doe", "john_doe", false},
		{"valid alphanumeric", "j0hn123", "j0hn123", false},
		{"too short", "a", "", true},
		{"too long", "a123456789012345678901234567890", "", true},
		{"invalid start symbol", ".john", "", true},
		{"invalid end symbol", "john_", "", true},
		{"consecutive dots", "john..doe", "", true},
		{"consecutive underscores", "john__doe", "", true},
		{"mixed consecutive symbols", "john._doe", "", true},
		{"invalid characters", "john@doe", "", true},
		{"whitespace trim", "  johnDoe  ", "johndoe", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := authservice.CleanUsername(tt.input)

			if (err != nil) != tt.wantErr {
				t.Errorf("CleanUsername() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if got != tt.expected {
				t.Errorf("CleanUsername() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestLoginTwoStepValidation(t *testing.T) {
	svc := authservice.NewAuthService(nil, nil, nil, nil, nil, "test_secret", 0, 0)

	// Step 1: empty identifier
	_, err := svc.LoginCredentials(t.Context(), "", "secret123", "email", "NG")
	if err == nil {
		t.Errorf("expected error for empty identifier, got nil")
	}

	// Step 1: empty password
	_, err = svc.LoginCredentials(t.Context(), "user@example.com", "", "email", "NG")
	if err == nil {
		t.Errorf("expected error for empty password, got nil")
	}

	// Step 2: empty preAuthToken
	_, err = svc.LoginPin(t.Context(), "", "1234")
	if err == nil {
		t.Errorf("expected error for empty preAuthToken, got nil")
	}

	// Step 2: invalid PIN length
	_, err = svc.LoginPin(t.Context(), "pat_123", "12")
	if err == nil {
		t.Errorf("expected error for invalid PIN length, got nil")
	}
}

