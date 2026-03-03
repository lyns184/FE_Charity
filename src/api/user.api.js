import api from "./axios"
import { API } from "@/constants/api-endpoints"

export const getProfile = () =>
  api.get(API.USER.PROFILE)

export const updateProfile = (data) =>
  api.put(API.USER.UPDATE_PROFILE, data)

export const changePassword = (data) =>
  api.put(API.USER.PASSWORD, data)

export const submitKYC = (data) =>
  api.post(API.USER.KYC, data)

export const getMyCampaigns = () =>
  api.get(API.USER.CAMPAIGNS)

export const getMyDonations = (params) =>
  api.get(API.USER.DONATIONS, { params })

export const getOrganizers = (params) =>
  api.get(API.ORGANIZERS, { params })
