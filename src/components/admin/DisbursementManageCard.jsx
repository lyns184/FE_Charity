import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import StatusBadge from "@/components/shared/StatusBadge"
import BlockchainLink from "@/components/shared/BlockchainLink"
import {
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Wallet,
  ZoomIn,
} from "lucide-react"
import { formatVND, formatDate } from "@/lib/utils"
import { DISBURSEMENT_STATUS } from "@/constants/enums"

export default function DisbursementManageCard({
  disbursement,
  onTransfer,
  onVerify,
  onReject,
}) {
  const [transferOpen, setTransferOpen] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState(null) // "transfer" | "verify" | "reject" | null
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState("")

  const status = disbursement.status
  const images = disbursement.proofImages ?? disbursement.images ?? []

  const handleTransfer = async () => {
    if (!txHash.trim()) return
    setLoading("transfer")
    try {
      await onTransfer(disbursement, txHash.trim())
    } finally {
      setLoading(null)
      setTransferOpen(false)
      setTxHash("")
    }
  }

  const handleVerify = async () => {
    setLoading("verify")
    try {
      await onVerify(disbursement)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setLoading("reject")
    try {
      await onReject(disbursement, rejectReason.trim())
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

  return (
    <>
      <Card className="py-0 overflow-hidden">
        <CardContent className="space-y-3 p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">
                {disbursement.campaignTitle || "Giải ngân"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {disbursement.campaignId
                  ? `Chiến dịch: ${disbursement.campaignId}`
                  : ""}
              </p>
            </div>
            <StatusBadge status={status} type="disbursement" />
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              {formatVND(disbursement.amount)}
            </span>
          </div>

          {/* Reason / description */}
          {(disbursement.reason || disbursement.description) && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {disbursement.reason || disbursement.description}
            </p>
          )}

          {/* Proof images */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => {
                const src = typeof img === "string" ? img : img.url ?? img
                return (
                  <button
                    key={idx}
                    onClick={() => openLightbox(src)}
                    className="group relative overflow-hidden rounded-md border hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Xem minh chứng ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Minh chứng ${idx + 1}`}
                      className="h-16 w-16 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <ZoomIn className="h-3.5 w-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Dates */}
          {disbursement.createdAt && (
            <p className="text-xs text-muted-foreground">
              Yêu cầu: {formatDate(disbursement.createdAt)}
            </p>
          )}

          {/* Blockchain link for completed */}
          {status === DISBURSEMENT_STATUS.COMPLETED &&
            disbursement.txHash && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Blockchain:</span>
                <BlockchainLink txHash={disbursement.txHash} />
              </div>
            )}

          {/* Rejection reason */}
          {status === DISBURSEMENT_STATUS.REJECTED &&
            disbursement.rejectionReason && (
              <p className="text-sm text-destructive">
                Lý do từ chối: {disbursement.rejectionReason}
              </p>
            )}

          {/* --- Status-conditional action buttons --- */}

          {/* PENDING_TRANSFER: Admin transfers money and enters txHash */}
          {status === DISBURSEMENT_STATUS.PENDING_TRANSFER && (
            <div className="pt-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setTransferOpen(true)}
                disabled={loading !== null}
              >
                <Send className="h-4 w-4" />
                Chuyển tiền
              </Button>
            </div>
          )}

          {/* PENDING_VERIFY: Admin verifies or rejects */}
          {status === DISBURSEMENT_STATUS.PENDING_VERIFY && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleVerify}
                disabled={loading !== null}
              >
                {loading === "verify" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Xác minh
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

      {/* Transfer dialog (enter txHash) */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển tiền giải ngân</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Số tiền: <strong>{formatVND(disbursement.amount)}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Nhập mã giao dịch (Transaction Hash) sau khi chuyển tiền:
            </p>
            <Input
              placeholder="0x..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferOpen(false)}
              disabled={loading === "transfer"}
            >
              Huỷ
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!txHash.trim() || loading === "transfer"}
            >
              {loading === "transfer" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Xác nhận chuyển
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối giải ngân</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Nhập lý do từ chối yêu cầu giải ngân này:
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

      {/* Image lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-2 sm:p-4">
          <DialogHeader>
            <DialogTitle>Ảnh minh chứng</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={lightboxImage}
              alt="Ảnh minh chứng phóng to"
              className="max-h-[75vh] w-auto rounded-md object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
