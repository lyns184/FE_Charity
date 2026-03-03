import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePolling } from "@/hooks/usePolling"
import { getPaymentStatus } from "@/api/payment.api"
import { PAYMENT_STATUS } from "@/constants/enums"
import { formatVND } from "@/lib/utils"
import BlockchainLink from "@/components/shared/BlockchainLink"
import { CheckCircle2, Clock, AlertCircle, Loader2, QrCode } from "lucide-react"

const POLL_INTERVAL = 3000
const POLL_TIMEOUT = 300000 // 5 minutes

export default function QRModal({ open, onOpenChange, payment, onPaymentSuccess }) {
  const [status, setStatus] = useState("pending") // "pending" | "success" | "failed" | "timeout"
  const [successData, setSuccessData] = useState(null)
  const [remainingSeconds, setRemainingSeconds] = useState(POLL_TIMEOUT / 1000)
  const countdownRef = useRef(null)

  // Countdown timer
  useEffect(() => {
    if (!open || status !== "pending") {
      if (countdownRef.current) clearInterval(countdownRef.current)
      return
    }

    setRemainingSeconds(POLL_TIMEOUT / 1000)

    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [open, status])

  // Reset state when modal opens with a new payment
  useEffect(() => {
    if (open) {
      setStatus("pending")
      setSuccessData(null)
    }
  }, [open, payment?._id])

  const pollFn = useCallback(async () => {
    if (!payment?._id) return null
    const res = await getPaymentStatus(payment._id)
    return res.data.payment
  }, [payment?._id])

  const isTerminal = useCallback(
    (data) =>
      data?.status === PAYMENT_STATUS.SUCCESS ||
      data?.status === PAYMENT_STATUS.FAILED,
    []
  )

  const onSuccess = useCallback((data) => {
    if (data?.status === PAYMENT_STATUS.FAILED) {
      setStatus("failed")
    } else {
      setStatus("success")
      setSuccessData(data)
      onPaymentSuccess?.()
    }
  }, [onPaymentSuccess])

  const onTimeout = useCallback(() => {
    setStatus("timeout")
  }, [])

  usePolling({
    fn: pollFn,
    interval: POLL_INTERVAL,
    timeout: POLL_TIMEOUT,
    enabled: open && status === "pending" && !!payment?._id,
    isTerminal,
    onSuccess,
    onTimeout,
  })

  const formattedTime = useMemo(() => {
    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }, [remainingSeconds])

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Thanh toán chuyển khoản
          </DialogTitle>
        </DialogHeader>

        {/* Pending state - QR code + countdown */}
        {status === "pending" && (
          <div className="flex flex-col items-center space-y-4 py-4">
            {payment?.qrCodeUrl ? (
              <img
                src={payment.qrCodeUrl}
                alt="QR thanh toán"
                className="w-64 h-64 rounded-lg border"
              />
            ) : (
              <div className="w-64 h-64 rounded-lg border flex items-center justify-center bg-muted">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                {formatVND(payment?.amount)}
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono">{formattedTime}</span>
              </div>
            </div>

            {payment?.transferContent && (
              <div className="w-full rounded-lg bg-muted px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Nội dung chuyển khoản</p>
                <p className="font-mono font-semibold tracking-widest text-sm select-all">
                  {payment.transferContent}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang chờ thanh toán...</span>
            </div>
          </div>
        )}

        {/* Success state */}
        {status === "success" && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-green-700">
                Thanh toán thành công!
              </h3>
              <p className="text-2xl font-bold text-primary">
                {formatVND(payment?.amount)}
              </p>
            </div>
            {successData?.blockchainTxHash && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  Giao dịch blockchain:
                </span>
                <BlockchainLink txHash={successData.blockchainTxHash} />
              </div>
            )}
          </div>
        )}

        {/* Failed state */}
        {status === "failed" && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-red-700">Thanh toán thất bại</h3>
              <p className="text-sm text-muted-foreground">
                Giao dịch không thành công. Vui lòng thử lại.
              </p>
            </div>
          </div>
        )}

        {/* Timeout state */}
        {status === "timeout" && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <AlertCircle className="h-16 w-16 text-yellow-500" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Hết thời gian</h3>
              <p className="text-sm text-muted-foreground">
                Không nhận được xác nhận thanh toán. Nếu bạn đã chuyển khoản, vui
                lòng kiểm tra lại sau vài phút.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant={status === "success" ? "default" : "outline"}
            onClick={handleClose}
            className="w-full"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
