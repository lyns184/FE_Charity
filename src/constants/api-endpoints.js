const BASE = "/api/v1"

export const API = {
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    LOGOUT: `${BASE}/auth/logout`,
    REFRESH: `${BASE}/auth/refresh`,
  },
  USER: {
    PROFILE: `${BASE}/user/profile/me`,
    UPDATE_PROFILE: `${BASE}/user/profile/update`,
    PASSWORD: `${BASE}/user/password`,
    KYC: `${BASE}/user/kyc`,
    CAMPAIGNS: `${BASE}/user/campaigns`,
    DONATIONS: `${BASE}/user/donations`,
  },
  CAMPAIGN: {
    CREATE: `${BASE}/campaigns`,
    LIST: `${BASE}/campaigns`,
    RELATED: (id) => `${BASE}/campaigns/related/${id}`,
    DETAIL: (id) => `${BASE}/campaigns/${id}`,
    UPDATE: (id) => `${BASE}/campaigns/${id}/update`,
    CLOSE: (id) => `${BASE}/campaigns/${id}/close`,
    SUMMARY: (id) => `${BASE}/campaigns/${id}/summary`,
    PROOFS: (id) => `${BASE}/campaigns/${id}/proofs`,
    DONATIONS: (id) => `${BASE}/campaigns/${id}/donations`,
  },
  PAYMENT: {
    CREATE: `${BASE}/payment/create`,
    STATUS: (id) => `${BASE}/payment/status/${id}`,
  },
  DISBURSEMENT: {
    REQUEST: `${BASE}/disbursement/request`,
    PROOF: (id) => `${BASE}/disbursement/${id}/proof`,
  },
  ADMIN: {
    KYC_LIST: `${BASE}/admin/kyc-list`,
    KYC_APPROVE: (userId) => `${BASE}/admin/user/${userId}/kyc`,
    CAMPAIGN_APPROVE: (id) => `${BASE}/admin/campaign/${id}/approve`,
    DISBURSE_TRANSFER: (id) => `${BASE}/admin/disbursement/${id}/transfer`,
    DISBURSE_VERIFY: (id) => `${BASE}/admin/disbursement/${id}/verify`,
  },
  VERIFY: {
    DONATION: (id) => `${BASE}/verify/donation/${id}`,
    DISBURSEMENT: (id) => `${BASE}/verify/disbursement/${id}`,
  },
  ORGANIZERS: `${BASE}/user/organizers`,
  UPLOAD: `${BASE}/upload`,
}
