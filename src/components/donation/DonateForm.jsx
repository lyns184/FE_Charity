import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPayment } from "@/api/payment.api"
import { useAuth } from "@/hooks/useAuth"
import { formatVND } from "@/lib/utils"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Link } from "react-router-dom"

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000]

export default function DonateForm({ campaignId, onPaymentCreated }) {
  const { isAuthenticated } = useAuth()
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePresetClick = (preset) => {
    setAmount(preset)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const numAmount = Number(amount)
    if (!numAmount || numAmount < 10000) {
      toast.error("Số tiền đóng góp tối thiểu là 10.000 VNĐ")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createPayment({
        campaignId,
        amount: numAmount,
        message: message.trim() || undefined,
        isAnonymous,
      })
      onPaymentCreated?.(res.data.payment)
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tạo thanh toán. Vui lòng thử lại."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            Vui lòng{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              đăng nhập
            </Link>{" "}
            để đóng góp cho chiến dịch này.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Đóng góp
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preset amounts */}
          <div className="space-y-2">
            <Label>Chọn số tiền</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handlePresetClick(preset)}
                >
                  {formatVND(preset)}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Hoặc nhập số tiền khác</Label>
            <Input
              id="custom-amount"
              type="number"
              min={10000}
              placeholder="Nhập số tiền (VNĐ)"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="donation-message">Lời nhắn (tuỳ chọn)</Label>
            <Textarea
              id="donation-message"
              placeholder="Gửi lời nhắn đến chiến dịch..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Anonymous switch */}
          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous-switch" className="cursor-pointer">
              Đóng góp ẩn danh
            </Label>
            <Switch
              id="anonymous-switch"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !amount}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Đóng góp ngay
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
