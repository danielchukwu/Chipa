package pinhandler

import (
	"encoding/json"
	"net/http"

	apimiddleware "chipa/api/internal/middleware"
	fintechservice "chipa/api/internal/service/fintech"
	"chipa/api/internal/utils"
)

type Handler struct {
	pinSvc *fintechservice.PINService
	utils  *utils.Utils
}

func NewHandler(pinSvc *fintechservice.PINService, utils *utils.Utils) *Handler {
	return &Handler{
		pinSvc: pinSvc,
		utils:  utils,
	}
}

type SetPINRequest struct {
	PIN string `json:"pin"`
}

// SetPIN godoc
// @Summary Set transaction PIN
// @Description Sets a 4-digit transaction PIN for the authenticated user
// @Tags Auth
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body SetPINRequest true "Transaction PIN"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /users/pin/set [post]
func (h *Handler) SetPIN(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req SetPINRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.pinSvc.SetPIN(r.Context(), claims.UserID, req.PIN); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Transaction PIN set successfully", nil)
}

type VerifyPINRequest struct {
	PIN string `json:"pin"`
}

// VerifyPIN godoc
// @Summary Verify transaction PIN
// @Description Verifies a 4-digit transaction PIN for the authenticated user
// @Tags Auth
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body VerifyPINRequest true "Transaction PIN"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /users/pin/verify [post]
func (h *Handler) VerifyPIN(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req VerifyPINRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	valid, err := h.pinSvc.VerifyPIN(r.Context(), claims.UserID, req.PIN)
	if err != nil || !valid {
		h.utils.RespondError(w, http.StatusUnauthorized, "Invalid transaction PIN")
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "PIN verified successfully", map[string]interface{}{
		"valid": true,
	})
}
