import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { getCampaignDetail, getCampaignDonations } from "@/api/campaign.api"
import ProgressBar from "@/components/shared/ProgressBar"
import StatusBadge from "@/components/shared/StatusBadge"
import BlockchainLink from "@/components/shared/BlockchainLink"
import DonationList from "@/components/donation/DonationList"
import DonateForm from "@/components/donation/DonateForm"
import QRModal from "@/components/donation/QRModal"
import CampaignSummaryAI from "@/components/campaign/CampaignSummaryAI"
import RelatedCampaigns from "@/components/campaign/RelatedCampaigns"
import PublicProofGallery from "@/components/disbursement/PublicProofGallery"
import { DetailSkeleton } from "@/components/shared/LoadingSkeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CAMPAIGN_STATUS, ACCOUNT_TYPE } from "@/constants/enums"
import { formatVND, formatDate, daysRemaining } from "@/lib/utils"
import { Calendar, Users, ArrowLeft, Clock } from "lucide-react"
import { toast } from "sonner"

const PLACEHOLDER_IMAGE = "https://placehold.co/800x450?text=No+Image"

export default function CampaignDetail() {
  const { id } = useParams()

  const [campaign, setCampaign] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false)
  const [payment, setPayment] = useState(null)

  // Donations state
  const [donations, setDonations] = useState([])

  // ───────────── Fetch campaign detail ─────────────
  // silent=true: refetch in background without showing skeleton (e.g. after payment)
  const fetchCampaign = useCallback(async (silent = false) => {
    if (!id) return
    if (!silent) {
      setIsLoading(true)
      setError(null)
    }
    try {
      const res = await getCampaignDetail(id)
      setCampaign(res.data.campaign ?? res.data)
    } catch (err) {
      if (!silent) {
        const message =
          err.response?.data?.message || "Không thể tải thông tin chiến dịch."
        setError(message)
        toast.error(message)
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [id])

  // ───────────── Fetch donations ─────────────
  const fetchDonations = useCallback(async () => {
    if (!id) return
    try {
      const res = await getCampaignDonations(id)
      setDonations(res.data.donations || [])
    } catch {
      // silent fail — donations không quan trọng bằng campaign
    }
  }, [id])

  useEffect(() => {
    fetchCampaign()
    fetchDonations()
  }, [fetchCampaign, fetchDonations])

  // ───────────── Handlers ─────────────
  const handlePaymentCreated = (paymentData) => {
    setPayment(paymentData)
    setQrOpen(true)
  }

  const handlePaymentSuccess = useCallback(() => {
    fetchCampaign(true)  // silent — no skeleton
    fetchDonations()
  }, [fetchCampaign, fetchDonations])

  // ───────────── Loading state ─────────────
  if (isLoading) {
    return <DetailSkeleton />
  }

  // ───────────── Error state ─────────────
  if (error || !campaign) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 rounded-full bg-red-50 p-4">
          <Clock className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Không thể tải chiến dịch
        </h2>
        <p className="mb-6 text-muted-foreground">
          {error || "Chiến dịch không tồn tại hoặc đã bị xóa."}
        </p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay về trang chủ
          </Link>
        </Button>
      </div>
    )
  }

  // ───────────── Derived values ─────────────
  const {
    _id: campaignId,
    title,
    description,
    imageUrl,
    status,
    currentAmount: _currentAmountField = 0,
    currentBalance: _currentBalanceField = 0,
    goalAmount = 0,
    endDate,
    createdAt,
    creator,
    blockchainTxHash,
  } = campaign

  // Support both field names: currentBalance (detail endpoint) and currentAmount (list endpoint)
  const currentAmount = _currentBalanceField || _currentAmountField

  const remaining = daysRemaining(endDate)
  const isAcceptingDonations =
    status === CAMPAIGN_STATUS.ACTIVE || status === CAMPAIGN_STATUS.GOAL_REACHED
  const isClosed = status === CAMPAIGN_STATUS.CLOSED
  const creatorName = creator?.fullName || creator?.name || "Ẩn danh"
  const creatorAvatar = creator?.avatarUrl || ""
  const creatorInitial = creatorName.charAt(0).toUpperCase()
  const creatorType = creator?.accountType
  const creatorTypeBadge =
    creatorType === ACCOUNT_TYPE.ORGANIZATION ? "Tổ chức" : "Cá nhân"

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
      </div>

      {/* ═══════════════ Two-column layout ═══════════════ */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ────────── Left column (2/3) ────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Campaign image */}
          <div className="overflow-hidden rounded-xl">
            <img
              src={imageUrl || PLACEHOLDER_IMAGE}
              alt={title || "Campaign image"}
              className="aspect-video w-full object-cover"
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGE
              }}
            />
          </div>

          {/* Title + Status */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {title}
              </h1>
              <StatusBadge status={status} type="campaign" />
            </div>

            {/* Creator info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {creatorAvatar && <AvatarImage src={creatorAvatar} alt={creatorName} />}
                <AvatarFallback>{creatorInitial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {creatorName}
                </span>
                <Badge
                  variant="outline"
                  className="mt-0.5 w-fit text-xs text-muted-foreground"
                >
                  {creatorTypeBadge}
                </Badge>
              </div>
            </div>
          </div>

          {/* Blockchain hash if available */}
          {blockchainTxHash && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Blockchain:</span>
              <BlockchainLink txHash={blockchainTxHash} />
            </div>
          )}

          {/* Description */}
          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {description || "Không có mô tả."}
            </p>
          </div>

          <Separator />

          {/* Donation list */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách đóng góp
            </h2>
            <DonationList donations={donations} isLoading={false} />
          </div>

          <Separator />

          {/* Proof gallery */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Minh chứng giải ngân
            </h2>
            <PublicProofGallery campaignId={campaignId} />
          </div>
        </div>

        {/* ────────── Right column (1/3) ────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            {/* Stats card */}
            <Card>
              <CardContent className="space-y-5 p-6">
                {/* Progress */}
                <ProgressBar current={currentAmount} goal={goalAmount} />

                {/* Stat rows */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Donations count */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <Users className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold leading-tight">
                        {donations.length}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Lượt đóng góp
                      </span>
                    </div>
                  </div>

                  {/* Days remaining */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold leading-tight">
                        {isClosed ? "0" : remaining}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Ngày còn lại
                      </span>
                    </div>
                  </div>
                </div>

                {/* End date */}
                {endDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Kết thúc: {formatDate(endDate)}
                    </span>
                  </div>
                )}

                {/* Closed notice */}
                {isClosed && (
                  <div className="rounded-lg bg-gray-50 p-3 text-center text-sm text-muted-foreground">
                    Chiến dịch đã kết thúc. Cảm ơn sự đóng góp của bạn!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donate form - only for active / goal-reached campaigns */}
            {isAcceptingDonations ? (
              <DonateForm
                campaignId={campaignId}
                onPaymentCreated={handlePaymentCreated}
              />
            ) : (
              !isClosed && (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    Chiến dịch hiện không nhận đóng góp.
                  </CardContent>
                </Card>
              )
            )}

            {/* AI Summary */}
            <CampaignSummaryAI campaignId={campaignId} />
          </div>
        </div>
      </div>

      {/* ═══════════════ Full-width bottom section ═══════════════ */}
      <div className="mt-12">
        <Separator className="mb-8" />
        <RelatedCampaigns campaignId={campaignId} />
      </div>

      {/* ═══════════════ QR Payment Modal ═══════════════ */}
      <QRModal open={qrOpen} onOpenChange={setQrOpen} payment={payment} onPaymentSuccess={handlePaymentSuccess} />
    </div>
  )
}
