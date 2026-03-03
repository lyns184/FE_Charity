import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import StatusBadge from "@/components/shared/StatusBadge"
import { CheckCircle, XCircle, Loader2, User } from "lucide-react"
import { formatVND, formatDate } from "@/lib/utils"

export default function CampaignApprovalCard({ campaign, onApprove, onReject }) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(null) // "approve" | "reject" | null

  const isPending = campaign.status === "PENDING"

  const handleApprove = async () => {
    setLoading("approve")
    try {
      await onApprove(campaign)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setLoading("reject")
    try {
      await onReject(campaign, rejectReason.trim())
    } finally {
      setLoading(null)
      setRejectOpen(false)
      setRejectReason("")
    }
  }

  return (
    <>
      <Card className="py-0 overflow-hidden">
        {/* Campaign image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {campaign.image ? (
            <img
              src={campaign.image}
              alt={campaign.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-sm">Không có hình ảnh</span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <StatusBadge status={campaign.status} type="campaign" />
          </div>
        </div>

        <CardContent className="space-y-3 p-4">
          {/* Title */}
          <h3 className="line-clamp-2 text-base font-semibold leading-tight">
            {campaign.title}
          </h3>

          {/* Creator */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">
              {campaign.creatorId?.name || campaign.createdBy?.name || "Ẩn danh"}
            </span>
          </div>

          {/* Goal amount */}
          <p className="text-sm font-medium text-emerald-700">
            Mục tiêu: {formatVND(campaign.goalAmount)}
          </p>

          {/* Description preview */}
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {campaign.description}
          </p>

          {/* Dates */}
          {campaign.createdAt && (
            <p className="text-xs text-muted-foreground">
              Tạo ngày: {formatDate(campaign.createdAt)}
            </p>
          )}

          {/* Rejection reason (if already rejected) */}
          {campaign.rejectionReason && (
            <p className="text-sm text-destructive">
              Lý do từ chối: {campaign.rejectionReason}
            </p>
          )}

          {/* Action buttons for pending campaigns */}
          {isPending && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleApprove}
                disabled={loading !== null}
              >
                {loading === "approve" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1.5"
                onClick={() => setRejectOpen(true)}
                disabled={loading !== null}
              >
                <XCircle className="h-4 w-4" />
                Từ chối
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject reason dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối chiến dịch</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Nhập lý do từ chối chiến dịch "{campaign.title}":
            </p>
            <Textarea
              placeholder="Lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={loading === "reject"}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || loading === "reject"}
            >
              {loading === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
