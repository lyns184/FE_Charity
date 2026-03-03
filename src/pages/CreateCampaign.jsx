import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import CampaignForm from "@/components/campaign/CampaignForm"
import KYCStatusBanner from "@/components/kyc/KYCStatusBanner"
import KYCUploadForm from "@/components/kyc/KYCUploadForm"
import { createCampaign } from "@/api/campaign.api"
import { submitKYC } from "@/api/user.api"
import { KYC_STATUS, USER_ROLE } from "@/constants/enums"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export default function CreateCampaign() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [kycLoading, setKycLoading] = useState(false)
  const [campaignLoading, setCampaignLoading] = useState(false)

  const kycStatus = user?.kycStatus || KYC_STATUS.NONE

  const handleKYCSubmit = async (formData) => {
    setKycLoading(true)
    try {
      // formData = { idCardFront: "url", idCardBack: "url", portrait: "url" }
      await submitKYC(formData)
      toast.success("Gửi yêu cầu xác minh thành công! Vui lòng chờ duyệt.")
      await refreshProfile()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gửi yêu cầu xác minh thất bại"
      toast.error(msg)
    } finally {
      setKycLoading(false)
    }
  }

  const handleCampaignSubmit = async (data) => {
    setCampaignLoading(true)
    try {
      await createCampaign(data)
      toast.success("Tạo chiến dịch thành công! Chiến dịch đang chờ duyệt.")
      navigate("/my-campaigns")
    } catch (err) {
      const msg =
        err.response?.data?.message || "Tạo chiến dịch thất bại"
      toast.error(msg)
    } finally {
      setCampaignLoading(false)
    }
  }

  // Admin cannot create campaigns
  if (user?.role === USER_ROLE.ADMIN) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Alert className="border-yellow-500/50 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Tài khoản quản trị viên không thể tạo chiến dịch gây quỹ.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Tạo chiến dịch</h1>
        <p className="mt-2 text-muted-foreground">
          Tạo chiến dịch gây quỹ để giúp đỡ cộng đồng
        </p>
      </div>

      {/* KYC Gate */}
      {kycStatus !== KYC_STATUS.APPROVED ? (
        <div className="space-y-6">
          <KYCStatusBanner status={kycStatus} />

          {(kycStatus === KYC_STATUS.NONE ||
            kycStatus === KYC_STATUS.REJECTED) && (
            <Card>
              <CardHeader>
                <CardTitle>Xác minh danh tính</CardTitle>
                <CardDescription>
                  Bạn cần xác minh danh tính trước khi tạo chiến dịch gây quỹ.
                  Vui lòng tải lên các giấy tờ cần thiết.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KYCUploadForm
                  accountType={user?.accountType}
                  onSubmit={handleKYCSubmit}
                  isLoading={kycLoading}
                />
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chiến dịch</CardTitle>
            <CardDescription>
              Điền thông tin chi tiết về chiến dịch gây quỹ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignForm
              onSubmit={handleCampaignSubmit}
              isLoading={campaignLoading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
