import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react"
import { DISBURSEMENT_STATUS } from "@/constants/enums"
import { formatVND, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import BlockchainLink from "@/components/shared/BlockchainLink"
import StatusBadge from "@/components/shared/StatusBadge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

/**
 * Steps in the disbursement lifecycle.
 * Each step maps to a status threshold.
 */
const STEPS = [
  { key: "request", label: "Yêu cầu giải ngân" },
  { key: "transfer", label: "Admin chuyển tiền" },
  { key: "verify", label: "Xác minh blockchain" },
  { key: "complete", label: "Hoàn tất" },
]

/** Map a disbursement status to the completed-step index (0-based). */
function completedIndex(status) {
  switch (status) {
    case DISBURSEMENT_STATUS.PENDING_TRANSFER:
      return 0
    case DISBURSEMENT_STATUS.PENDING_VERIFY:
      return 1
    case DISBURSEMENT_STATUS.COMPLETED:
      return 3
    case DISBURSEMENT_STATUS.REJECTED:
      return -1 // special handling
    default:
      return -1
  }
}

function StepIcon({ stepIdx, doneIdx, isRejected }) {
  if (isRejected) {
    // First step shows red X, the rest stay gray
    if (stepIdx === 0)
      return <XCircle className="h-6 w-6 text-red-500 shrink-0" />
    return <Clock className="h-6 w-6 text-gray-300 shrink-0" />
  }
  if (stepIdx < doneIdx) {
    return <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
  }
  if (stepIdx === doneIdx) {
    return <Circle className="h-6 w-6 text-blue-600 fill-blue-100 shrink-0" />
  }
  return <Clock className="h-6 w-6 text-gray-300 shrink-0" />
}

export default function DisbursementTimeline({ disbursements = [] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState("")

  const openLightbox = (src) => {
    setLightboxImage(src)
    setLightboxOpen(true)
  }

  if (!disbursements.length) return null

  return (
    <>
      <div className="space-y-6">
        {disbursements.map((d) => {
          const isRejected = d.status === DISBURSEMENT_STATUS.REJECTED
          const doneIdx = completedIndex(d.status)
          const images = d.proofImages ?? d.images ?? []
          const reportHash = d.reportHash ?? d.txHash ?? null

          return (
            <div
              key={d._id}
              className="rounded-xl border bg-card p-5 space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">
                    {formatVND(d.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(d.createdAt)}
                  </p>
                </div>
                <StatusBadge status={d.status} type="disbursement" />
              </div>

              {/* Reason */}
              {d.reason && (
                <p className="text-sm text-muted-foreground">{d.reason}</p>
              )}

              {/* Rejection reason from admin */}
              {isRejected && d.rejectReason && (
                <p className="text-sm text-red-600">
                  Lý do từ chối: {d.rejectReason}
                </p>
              )}

              {/* Timeline steps */}
              <div className="relative flex items-start gap-0">
                {STEPS.map((step, idx) => (
                  <div
                    key={step.key}
                    className="flex flex-1 flex-col items-center text-center"
                  >
                    {/* Connector line */}
                    {idx > 0 && (
                      <div
                        className={cn(
                          "absolute top-3 h-0.5 -translate-y-1/2",
                          isRejected
                            ? "bg-gray-200"
                            : idx <= doneIdx
                              ? "bg-green-400"
                              : "bg-gray-200"
                        )}
                        style={{
                          left: `${((idx - 1) / STEPS.length) * 100 + 100 / (2 * STEPS.length)}%`,
                          width: `${100 / STEPS.length}%`,
                        }}
                      />
                    )}
                    <div className="relative z-10 rounded-full bg-white">
                      <StepIcon
                        stepIdx={idx}
                        doneIdx={doneIdx}
                        isRejected={isRejected}
                      />
                    </div>
                    <span className="mt-1.5 text-xs text-muted-foreground leading-tight">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Proof images (thumbnails) */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {images.map((img, idx) => {
                    const src = typeof img === "string" ? img : img.url ?? img
                    return (
                      <button
                        key={idx}
                        onClick={() => openLightbox(src)}
                        className="overflow-hidden rounded-md border hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`Xem ảnh minh chứng ${idx + 1}`}
                      >
                        <img
                          src={src}
                          alt={`Minh chứng ${idx + 1}`}
                          className="h-16 w-16 object-cover"
                        />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Blockchain link */}
              {reportHash && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Blockchain:</span>
                  <BlockchainLink txHash={reportHash} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox dialog */}
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
