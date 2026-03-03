import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import StatusBadge from "@/components/shared/StatusBadge"
import { CheckCircle, XCircle, ZoomIn, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { ACCOUNT_TYPE } from "@/constants/enums"

export default function KYCReviewCard({ kyc, onApprove, onReject }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState("")
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(null) // "approve" | "reject" | null

  const user = kyc.user ?? kyc
  const documents = kyc.documents ?? kyc.kycDocuments ?? []
  const initials = (user.name || "U").charAt(0).toUpperCase()

  const handleApprove = async () => {
    setLoading("approve")
    try {
      await onApprove(kyc)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setLoading("reject")
    try {
      await onReject(kyc, rejectReason.trim())
    } finally {
      setLoading(null)
      setRejectOpen(false)
      setRejectReason("")
    }
  }

  const openLightbox = (src) => {
    setLightboxImage(src)
    setLightboxOpen(true)
  }

  const isPending = (kyc.kycStatus ?? kyc.status) === "PENDING"

  return (
    <>
      <Card className="py-0 overflow-hidden">
        <CardContent className="space-y-4 p-4">
          {/* User info row */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{user.name || "N/A"}</p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email || ""}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {user.accountType && (
                <Badge variant="outline" className="text-xs">
                  {user.accountType === ACCOUNT_TYPE.ORGANIZATION
                    ? "Tổ chức"
                    : "Cá nhân"}
                </Badge>
              )}
              <StatusBadge
                status={kyc.kycStatus ?? kyc.status}
                type="kyc"
              />
            </div>
          </div>

          {/* Submitted date */}
          {kyc.submittedAt && (
            <p className="text-xs text-muted-foreground">
              Ngày nộp: {formatDate(kyc.submittedAt)}
            </p>
          )}

          {/* Document thumbnails */}
          {documents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {documents.map((doc, idx) => {
                const src = typeof doc === "string" ? doc : doc.url ?? doc
                return (
                  <button
                    key={idx}
                    onClick={() => openLightbox(src)}
                    className="group relative overflow-hidden rounded-md border hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Xem tài liệu ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Tài liệu ${idx + 1}`}
                      className="h-20 w-20 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Rejection reason (if already rejected) */}
          {kyc.rejectionReason && (
            <p className="text-sm text-destructive">
              Lý do từ chối: {kyc.rejectionReason}
            </p>
          )}

          {/* Action buttons for pending KYC */}
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

      {/* Image lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-2 sm:p-4">
          <DialogHeader>
            <DialogTitle>Tài liệu KYC</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={lightboxImage}
              alt="Tài liệu KYC phóng to"
              className="max-h-[75vh] w-auto rounded-md object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject reason dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối KYC</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Nhập lý do từ chối KYC của {user.name || "người dùng"}:
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
