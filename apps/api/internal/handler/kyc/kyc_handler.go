package kychandler

import (
	"encoding/json"
	"net/http"

	apimiddleware "chipa/api/internal/middleware"
	fintechservice "chipa/api/internal/service/fintech"
	"chipa/api/internal/utils"
)

type Handler struct {
	kycSvc *fintechservice.KYCService
	utils  *utils.Utils
}

func NewHandler(kycSvc *fintechservice.KYCService, utils *utils.Utils) *Handler {
	return &Handler{
		kycSvc: kycSvc,
		utils:  utils,
	}
}

// GetKYCStatus godoc
// @Summary      Get user KYC tier and status
// @Description  Returns current KYC level (0-3), transaction limits, unlocked features, and verification state.
// @Tags         KYC
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} map[string]interface{} "KYC status retrieved"
// @Failure      401 {object} map[string]interface{} "Unauthorized"
// @Failure      500 {object} map[string]interface{} "Internal server error"
// @Router       /kyc/status [get]
func (h *Handler) GetKYCStatus(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	status, err := h.kycSvc.GetKYCStatus(r.Context(), claims.UserID)
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "KYC status retrieved successfully", map[string]interface{}{
		"kyc": status,
	})
}

type SubmitTier1Request struct {
	CountryCode    string `json:"country_code,omitempty" example:"NG"`
	DocumentType   string `json:"document_type,omitempty" example:"bvn"` // bvn, nin, ghana_card, kra_pin, huduma_namba, sa_id, national_id
	IDNumber       string `json:"id_number,omitempty" example:"22222222222"`
	DocumentNumber string `json:"document_number,omitempty" example:"22222222222"`
	BVN            string `json:"bvn,omitempty" example:"22222222222"`
	NIN            string `json:"nin,omitempty" example:"11111111111"`
}

// SubmitTier1 godoc
// @Summary      Submit Tier 1 KYC (Pan-African Identity: BVN, NIN, Ghana Card, KRA PIN, SA ID)
// @Description  Verifies primary identity credentials across African jurisdictions (Nigeria BVN/NIN, Ghana Card, Kenya KRA PIN, South Africa ID) to upgrade account limits.
// @Tags         KYC
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body SubmitTier1Request true "Identity document details"
// @Success      200 {object} map[string]interface{} "Upgraded to Tier 1"
// @Failure      400 {object} map[string]interface{} "Invalid input"
// @Failure      401 {object} map[string]interface{} "Unauthorized"
// @Failure      500 {object} map[string]interface{} "Verification failed"
// @Router       /kyc/tier1 [post]
func (h *Handler) SubmitTier1(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req SubmitTier1Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	idNum := req.IDNumber
	if idNum == "" {
		idNum = req.DocumentNumber
	}

	bvn := req.BVN
	if bvn == "" && req.DocumentType == "bvn" {
		bvn = idNum
	}
	nin := req.NIN
	if nin == "" && req.DocumentType == "nin" {
		nin = idNum
	}

	status, err := h.kycSvc.SubmitTier1PanAfrican(r.Context(), claims.UserID, fintechservice.Tier1Payload{
		CountryCode:  req.CountryCode,
		DocumentType: req.DocumentType,
		IDNumber:     idNum,
		BVN:          bvn,
		NIN:          nin,
	})
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Tier 1 verified successfully", map[string]interface{}{
		"kyc": status,
	})
}

// @Summary      Submit Tier 1 Pan-African KYC (BVN, NIN, Ghana Card, KRA PIN, SA ID)
// @Description  Verifies primary identity credentials across African jurisdictions (Nigeria BVN/NIN, Ghana Card, Kenya KRA PIN, South Africa ID) to upgrade account limits and provision DVA.
// @Tags         KYC
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body SubmitTier1Request true "Identity document details"
// @Success      200 {object} map[string]interface{} "Upgraded to Tier 1"
// @Failure      400 {object} map[string]interface{} "Invalid input"
// @Failure      401 {object} map[string]interface{} "Unauthorized"
// @Failure      500 {object} map[string]interface{} "Verification failed"
// @Router       /kyc/tier1/pan-african [post]
func (h *Handler) SubmitTier1PanAfrican(w http.ResponseWriter, r *http.Request) {
	h.SubmitTier1(w, r)
}

type SubmitTier2Request struct {
	CountryCode    string `json:"country_code,omitempty" example:"NG"`
	DocumentType   string `json:"document_type" example:"passport"` // passport, national_id, drivers_license, residence_permit
	DocumentNumber string `json:"document_number" example:"A09871234"`
	DocumentFileID string `json:"document_file_id" example:"file_id_or_url"`
	SelfieFileID   string `json:"selfie_file_id" example:"selfie_id_or_url"`
}

// SubmitTier2 godoc
// @Summary      Submit Tier 2 KYC (Government Photo ID & Facial Liveness)
// @Description  Submits official ID and selfie to unlock USD/EUR/GBP accounts and card issuance.
// @Tags         KYC
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body SubmitTier2Request true "Government ID details"
// @Success      200 {object} map[string]interface{} "Upgraded to Tier 2"
// @Failure      400 {object} map[string]interface{} "Invalid input"
// @Failure      401 {object} map[string]interface{} "Unauthorized"
// @Failure      500 {object} map[string]interface{} "Verification failed"
// @Router       /kyc/tier2 [post]
func (h *Handler) SubmitTier2(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req SubmitTier2Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	status, err := h.kycSvc.SubmitTier2(r.Context(), claims.UserID, req.DocumentType, req.DocumentNumber, req.DocumentFileID, req.SelfieFileID, req.CountryCode)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Tier 2 verified successfully. USD/EUR/GBP accounts unlocked!", map[string]interface{}{
		"kyc": status,
	})
}

type SubmitTier3Request struct {
	CountryCode       string `json:"country_code,omitempty" example:"NG"`
	Address           string `json:"address" example:"12 Admiralty Way, Lekki Phase 1"`
	City              string `json:"city" example:"Lagos"`
	State             string `json:"state" example:"Lagos"`
	UtilityBillFileID string `json:"utility_bill_file_id" example:"utility_file_id"`
}

// SubmitTier3 godoc
// @Summary      Submit Tier 3 KYC (Proof of Address)
// @Description  Submits utility bill / bank statement for unlimited cross-border volume and institutional limits.
// @Tags         KYC
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body SubmitTier3Request true "Address Proof"
// @Success      200 {object} map[string]interface{} "Upgraded to Tier 3"
// @Failure      400 {object} map[string]interface{} "Invalid input"
// @Failure      401 {object} map[string]interface{} "Unauthorized"
// @Failure      500 {object} map[string]interface{} "Verification failed"
// @Router       /kyc/tier3 [post]
func (h *Handler) SubmitTier3(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req SubmitTier3Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	status, err := h.kycSvc.SubmitTier3(r.Context(), claims.UserID, req.UtilityBillFileID, req.Address, req.City, req.State, req.CountryCode)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Tier 3 verified successfully. Unlimited compliance tier active!", map[string]interface{}{
		"kyc": status,
	})
}

type ComplianceScreeningRequest struct {
	IsPEP           bool   `json:"is_pep" example:"false"`
	SanctionsStatus string `json:"sanctions_status" example:"clear"` // clear, flagged, blocked
	TaxID           string `json:"tax_id,omitempty" example:"A012345678X"`
}

// UpdateComplianceScreening godoc
// @Summary      Update PEP and Sanctions compliance screening
// @Description  Records AML screening status, PEP declaration, and tax identification number.
// @Tags         KYC
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body ComplianceScreeningRequest true "Screening details"
// @Success      200 {object} map[string]interface{} "Compliance updated"
// @Failure      400 {object} map[string]interface{} "Invalid input"
// @Failure      401 {object} map[string]interface{} "Unauthorized"
// @Failure      500 {object} map[string]interface{} "Internal server error"
// @Router       /kyc/compliance-screening [post]
func (h *Handler) UpdateComplianceScreening(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req ComplianceScreeningRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.kycSvc.UpdateComplianceProfile(r.Context(), claims.UserID, req.IsPEP, req.SanctionsStatus, req.TaxID); err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	status, err := h.kycSvc.GetKYCStatus(r.Context(), claims.UserID)
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Compliance screening profile updated successfully", map[string]interface{}{
		"kyc": status,
	})
}
