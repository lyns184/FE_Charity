import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getKYCList } from "@/api/admin.api"
import { getCampaigns } from "@/api/campaign.api"
import AdminStatsCards from "@/components/admin/AdminStatsCards"
import KYCReviewCard from "@/components/admin/KYCReviewCard"
import CampaignApprovalCard from "@/components/admin/CampaignApprovalCard"
import { approveKYC, approveCampaign } from "@/api/admin.api"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutDashboard, Inbox } from "lucide-react"
import { KYC_STATUS, CAMPAIGN_STATUS } from "@/constants/enums"
import { toast } from "sonner"

export default function Dashboard() {
  const [kycList, setKycList] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [kycRes, campaignRes] = await Promise.all([
        getKYCList(),
        getCampaigns({ status: CAMPAIGN_STATUS.PENDING, limit: 50 }),
      ])
      setKycList(kycRes.data.users ?? kycRes.data ?? [])
      setCampaigns(campaignRes.data.campaigns ?? campaignRes.data ?? [])
    } catch (err) {
      toast.error("Không thể tải dữ liệu Dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Compute stats
  const pendingKYC = kycList.filter(
    (k) => (k.kycStatus ?? k.status) === KYC_STATUS.PENDING
  )
  const pendingCampaigns = campaigns.filter(
    (c) => c.status === CAMPAIGN_STATUS.PENDING
  )

  const statsData = {
    totalUsers: kycList.length,
    totalCampaigns: campaigns.length,
    totalDonations: campaigns.reduce(
      (sum, c) => sum + (c.currentAmount ?? 0),
      0
    ),
    pendingKYC: pendingKYC.length,
  }

  // --- KYC action handlers ---
  const handleKYCApprove = async (kyc) => {
    const userId = kyc.user?._id ?? kyc._id
    await approveKYC(userId, { status: "APPROVED" })
    toast.success("Đã duyệt KYC thành công")
    fetchData()
  }

  const handleKYCReject = async (kyc, reason) => {
    const userId = kyc.user?._id ?? kyc._id
    await approveKYC(userId, {
      status: "REJECTED",
      rejectionReason: reason,
    })
    toast.success("Đã từ chối KYC")
    fetchData()
  }

  // --- Campaign action handlers ---
  const handleCampaignApprove = async (campaign) => {
    await approveCampaign(campaign._id, { status: "ACTIVE" })
    toast.success("Đã duyệt chiến dịch thành công")
    fetchData()
  }

  const handleCampaignReject = async (campaign, reason) => {
    await approveCampaign(campaign._id, {
      status: "REJECTED",
      rejectionReason: reason,
    })
    toast.success("Đã từ chối chiến dịch")
    fetchData()
  }

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Stats cards */}
      <AdminStatsCards data={statsData} />

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <>
          {/* Recent pending KYC */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">KYC chờ duyệt</h2>
              {pendingKYC.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/kyc" className="gap-1">
                    Xem tất cả
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            {pendingKYC.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Không có KYC chờ duyệt"
                description="Tất cả yêu cầu KYC đã được xử lý."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingKYC.slice(0, 3).map((kyc) => (
                  <KYCReviewCard
                    key={kyc._id ?? kyc.user?._id}
                    kyc={kyc}
                    onApprove={handleKYCApprove}
                    onReject={handleKYCReject}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recent pending campaigns */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chiến dịch chờ duyệt</h2>
              {pendingCampaigns.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/campaigns" className="gap-1">
                    Xem tất cả
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            {pendingCampaigns.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Không có chiến dịch chờ duyệt"
                description="Tất cả chiến dịch đã được xử lý."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingCampaigns.slice(0, 3).map((campaign) => (
                  <CampaignApprovalCard
                    key={campaign._id}
                    campaign={campaign}
                    onApprove={handleCampaignApprove}
                    onReject={handleCampaignReject}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
