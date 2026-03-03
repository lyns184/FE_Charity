import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { getCampaignDetail, getCampaignSummary } from "@/api/campaign.api"
import { DISBURSEMENT_STATUS, CAMPAIGN_STATUS } from "@/constants/enums"
import { formatVND } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import ProgressBar from "@/components/shared/ProgressBar"
import StatusBadge from "@/components/shared/StatusBadge"
import EmptyState from "@/components/shared/EmptyState"
import DisbursementTimeline from "@/components/disbursement/DisbursementTimeline"
import DisbursementRequestForm from "@/components/disbursement/DisbursementRequestForm"
import ProofUploadForm from "@/components/disbursement/ProofUploadForm"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Banknote,
  FolderHeart,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-48" />
      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-6 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="rounded-xl border p-6 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function DisbursementRequest() {
  const { id } = useParams()
  const { user } = useAuth()

  const [campaign, setCampaign] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [campaignRes, summaryRes] = await Promise.all([
        getCampaignDetail(id),
        getCampaignSummary(id),
      ])
      setCampaign(campaignRes.data.campaign ?? campaignRes.data)
      setSummary(summaryRes.data.summary ?? summaryRes.data)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể tải thông tin chiến dịch"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Loading
  if (loading) return <PageSkeleton />

  // Error
  if (error || !campaign) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState
          icon={AlertTriangle}
          title="Không thể tải dữ liệu"
          description={error || "Chiến dịch không tồn tại hoặc bạn không có quyền truy cập."}
          action={
            <Button asChild variant="outline">
              <Link to="/my-campaigns">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  // Campaign data
  const campaignId = campaign._id || campaign.id
  const currentAmount = campaign.currentBalance ?? campaign.currentAmount ?? 0
  const goalAmount = campaign.goalAmount ?? 0
  const disbursements = summary?.disbursements ?? campaign.disbursements ?? []
  const totalDisbursed = summary?.totalDisbursed ??
    disbursements
      .filter((d) => d.status !== DISBURSEMENT_STATUS.REJECTED)
      .reduce((sum, d) => sum + (d.amount || 0), 0)
  const availableAmount = Math.max(currentAmount - totalDisbursed, 0)

  // Status checks
  const canRequestDisbursement =
    campaign.status === CAMPAIGN_STATUS.GOAL_REACHED ||
    campaign.status === CAMPAIGN_STATUS.CLOSED ||
    campaign.status === CAMPAIGN_STATUS.ACTIVE

  // Find disbursements in PENDING_VERIFY status (need proof upload)
  const pendingVerifyDisbursement = disbursements.find(
    (d) => d.status === DISBURSEMENT_STATUS.PENDING_VERIFY
  )

  const imageUrl =
    typeof campaign.image === "string"
      ? campaign.image
      : campaign.image?.url || null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back link */}
      <Button asChild variant="ghost" className="mb-4 -ml-2">
        <Link to="/my-campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Chiến dịch của tôi
        </Link>
      </Button>

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Banknote className="h-7 w-7 text-primary" />
          Yêu cầu giải ngân
        </h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý các yêu cầu giải ngân cho chiến dịch này
        </p>
      </div>

      {/* Campaign summary card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {/* Thumbnail */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={campaign.title}
                className="h-20 w-20 shrink-0 rounded-lg border object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-muted">
                <FolderHeart className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold leading-tight line-clamp-2">
                  {campaign.title}
                </h2>
                <StatusBadge status={campaign.status} type="campaign" />
              </div>
              <ProgressBar current={currentAmount} goal={goalAmount} />
            </div>
          </div>

          {/* Financial summary */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Tổng nhận</p>
              <p className="text-sm font-semibold">{formatVND(currentAmount)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Đã giải ngân</p>
              <p className="text-sm font-semibold text-orange-600">
                {formatVND(totalDisbursed)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Khả dụng</p>
              <p className="text-sm font-semibold text-green-700">
                {formatVND(availableAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content: 2-column layout on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Request form + Proof upload */}
        <div className="space-y-6">
          {/* Disbursement request form */}
          {canRequestDisbursement && availableAmount > 0 && (
            <DisbursementRequestForm
              campaignId={campaignId}
              availableAmount={availableAmount}
              onSuccess={fetchData}
            />
          )}

          {/* No available balance message */}
          {availableAmount <= 0 && (
            <Card>
              <CardContent className="p-5">
                <EmptyState
                  icon={Banknote}
                  title="Không có số dư khả dụng"
                  description="Tất cả số tiền đã được giải ngân hoặc đang chờ xử lý."
                />
              </CardContent>
            </Card>
          )}

          {/* Proof upload for PENDING_VERIFY disbursements */}
          {pendingVerifyDisbursement && (
            <ProofUploadForm
              disbursementId={pendingVerifyDisbursement._id}
              onSuccess={fetchData}
            />
          )}
        </div>

        {/* Right column: Timeline of disbursements */}
        <div>
          <h3 className="mb-3 text-base font-semibold">
            Lịch sử giải ngân ({disbursements.length})
          </h3>
          {disbursements.length > 0 ? (
            <DisbursementTimeline disbursements={disbursements} />
          ) : (
            <Card>
              <CardContent className="p-5">
                <EmptyState
                  icon={Banknote}
                  title="Chưa có yêu cầu nào"
                  description="Tạo yêu cầu giải ngân đầu tiên để bắt đầu."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
