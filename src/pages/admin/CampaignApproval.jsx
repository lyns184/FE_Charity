import { useState, useEffect, useCallback } from "react"
import { getCampaigns } from "@/api/campaign.api"
import { approveCampaign } from "@/api/admin.api"
import CampaignApprovalCard from "@/components/admin/CampaignApprovalCard"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileCheck, Inbox } from "lucide-react"
import { CAMPAIGN_STATUS } from "@/constants/enums"
import { toast } from "sonner"

export default function CampaignApproval() {
  const [allCampaigns, setAllCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("PENDING")

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch campaigns for each status separately and merge
      const [pendingRes, activeRes, rejectedRes] = await Promise.all([
        getCampaigns({ status: CAMPAIGN_STATUS.PENDING, limit: 200 }),
        getCampaigns({ status: CAMPAIGN_STATUS.ACTIVE + "," + CAMPAIGN_STATUS.GOAL_REACHED, limit: 200 }),
        getCampaigns({ status: CAMPAIGN_STATUS.REJECTED, limit: 200 }),
      ])
      const pending = pendingRes.data.campaigns ?? pendingRes.data ?? []
      const active = activeRes.data.campaigns ?? activeRes.data ?? []
      const rejected = rejectedRes.data.campaigns ?? rejectedRes.data ?? []
      setAllCampaigns([...pending, ...active, ...rejected])
    } catch {
      toast.error("Không thể tải danh sách chiến dịch")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  // Filter by tab
  const filtered = allCampaigns.filter((c) => {
    if (activeTab === "PENDING") return c.status === CAMPAIGN_STATUS.PENDING
    if (activeTab === "ACTIVE") return c.status === CAMPAIGN_STATUS.ACTIVE
    if (activeTab === "REJECTED") return c.status === CAMPAIGN_STATUS.REJECTED
    return true
  })

  // Tab counts
  const countByStatus = (status) =>
    allCampaigns.filter((c) => c.status === status).length

  // --- Action handlers ---
  const handleApprove = async (campaign) => {
    try {
      await approveCampaign(campaign._id, { status: "ACTIVE" })
      toast.success("Đã duyệt chiến dịch thành công")
      fetchCampaigns()
    } catch {
      toast.error("Duyệt chiến dịch thất bại")
    }
  }

  const handleReject = async (campaign, reason) => {
    try {
      await approveCampaign(campaign._id, {
        status: "REJECTED",
        rejectionReason: reason,
      })
      toast.success("Đã từ chối chiến dịch")
      fetchCampaigns()
    } catch {
      toast.error("Từ chối chiến dịch thất bại")
    }
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center gap-2">
        <FileCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Duyệt chiến dịch</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="PENDING">
            Chờ duyệt
            {!isLoading && (
              <span className="ml-1.5 text-xs opacity-70">
                ({countByStatus(CAMPAIGN_STATUS.PENDING)})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ACTIVE">
            Đã duyệt
            {!isLoading && (
              <span className="ml-1.5 text-xs opacity-70">
                ({countByStatus(CAMPAIGN_STATUS.ACTIVE)})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            Từ chối
            {!isLoading && (
              <span className="ml-1.5 text-xs opacity-70">
                ({countByStatus(CAMPAIGN_STATUS.REJECTED)})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {["PENDING", "ACTIVE", "REJECTED"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            {isLoading ? (
              <CardSkeleton count={3} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Không có chiến dịch"
                description={`Không có chiến dịch nào ở trạng thái "${
                  tabValue === "PENDING"
                    ? "Chờ duyệt"
                    : tabValue === "ACTIVE"
                    ? "Đã duyệt"
                    : "Từ chối"
                }".`}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((campaign) => (
                  <CampaignApprovalCard
                    key={campaign._id}
                    campaign={campaign}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
