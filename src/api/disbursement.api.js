import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const requestDisbursement = (data) =>
  api.post(API.DISBURSEMENT.REQUEST, data)
// data: { campaignId, amount, reason }

export const uploadProof = (id, formData) =>
  api.post(API.DISBURSEMENT.PROOF(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
// formData contains proofImages (multiple files)
