import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import ImageUpload from "@/components/shared/ImageUpload"
import { ACCOUNT_TYPE } from "@/constants/enums"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

const INDIVIDUAL_FIELDS = [
  { key: "idCardFront", label: "Mặt trước CMND/CCCD" },
  { key: "idCardBack", label: "Mặt sau CMND/CCCD" },
  { key: "portrait", label: "Ảnh chân dung với CMND" },
]

const ORGANIZATION_FIELDS = [
  { key: "businessLicense", label: "Giấy phép kinh doanh" },
  { key: "authorizationLetter", label: "Thư uỷ quyền" },
  { key: "representativeIdCard", label: "CMND người đại diện" },
]

export default function KYCUploadForm({ accountType, onSubmit, isLoading }) {
  const fields =
    accountType === ACCOUNT_TYPE.ORGANIZATION
      ? ORGANIZATION_FIELDS
      : INDIVIDUAL_FIELDS

  const [formData, setFormData] = useState(() => {
    const initial = {}
    fields.forEach((f) => {
      initial[f.key] = null
    })
    return initial
  })

  const handleUpload = (key, result) => {
    setFormData((prev) => ({ ...prev, [key]: result }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const missingFields = fields.filter((f) => !formData[f.key])
    if (missingFields.length > 0) {
      toast.error(
        `Vui lòng tải lên: ${missingFields.map((f) => f.label).join(", ")}`
      )
      return
    }

    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <ImageUpload
              label=""
              preview={formData[field.key] || null}
              onUpload={(result) => handleUpload(field.key, result)}
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang gửi...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Gửi xác minh
          </>
        )}
      </Button>
    </form>
  )
}
