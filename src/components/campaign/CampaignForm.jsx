import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ImageUpload from "@/components/shared/ImageUpload"
import { CAMPAIGN_STATUS } from "@/constants/enums"
import { formatVND } from "@/lib/utils"
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function CampaignForm({ initialData, onSubmit, isLoading }) {
  const isEditing = !!initialData
  const isActiveEditing = isEditing && initialData.status === CAMPAIGN_STATUS.ACTIVE

  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    endDate: "",
    image: null,
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        goalAmount: initialData.goalAmount || "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
        image: initialData.image || null,
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (result) => {
    setForm((prev) => ({ ...prev, image: result }))
  }

  const validate = () => {
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề chiến dịch")
      return false
    }
    if (form.title.trim().length > 200) {
      toast.error("Tiêu đề không được vượt quá 200 ký tự")
      return false
    }
    if (!form.description.trim()) {
      toast.error("Vui lòng nhập mô tả chiến dịch")
      return false
    }
    const goalNum = Number(form.goalAmount)
    if (!form.goalAmount || isNaN(goalNum) || goalNum < 100000) {
      toast.error("Mục tiêu tối thiểu là 100.000 VNĐ")
      return false
    }
    if (!form.endDate) {
      toast.error("Vui lòng chọn ngày kết thúc")
      return false
    }
    const end = new Date(form.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (end <= today) {
      toast.error("Ngày kết thúc phải ở trong tương lai")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      goalAmount: Number(form.goalAmount),
      endDate: form.endDate,
    }

    if (form.image) {
      payload.image = form.image
    }

    onSubmit?.(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isActiveEditing && (
        <Alert className="border-yellow-500/50 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Cập nhật chiến dịch đang hoạt động sẽ chuyển trạng thái về Chờ duyệt.
          </AlertDescription>
        </Alert>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Tiêu đề chiến dịch <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Nhập tiêu đề chiến dịch..."
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          {form.title.length}/200 ký tự
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Mô tả <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Mô tả chi tiết về chiến dịch của bạn..."
          rows={6}
        />
      </div>

      {/* Goal Amount */}
      <div className="space-y-2">
        <Label htmlFor="goalAmount">
          Mục tiêu gây quỹ <span className="text-destructive">*</span>
        </Label>
        <Input
          id="goalAmount"
          name="goalAmount"
          type="number"
          value={form.goalAmount}
          onChange={handleChange}
          placeholder="100000"
          min={100000}
        />
        {form.goalAmount && !isNaN(Number(form.goalAmount)) && (
          <p className="text-xs text-muted-foreground">
            {formatVND(Number(form.goalAmount))}
          </p>
        )}
      </div>

      {/* End Date */}
      <div className="space-y-2">
        <Label htmlFor="endDate">
          Ngày kết thúc <span className="text-destructive">*</span>
        </Label>
        <Input
          id="endDate"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label>Ảnh chiến dịch</Label>
        <ImageUpload
          label=""
          preview={form.image || null}
          onUpload={handleImageUpload}
        />
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý...
          </>
        ) : isEditing ? (
          "Cập nhật chiến dịch"
        ) : (
          "Tạo chiến dịch"
        )}
      </Button>
    </form>
  )
}
