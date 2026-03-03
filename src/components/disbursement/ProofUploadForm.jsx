import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ImagePlus, X, Upload } from "lucide-react"
import { toast } from "sonner"
import { uploadProof } from "@/api/disbursement.api"
import ImageUpload from "@/components/shared/ImageUpload"

const MAX_IMAGES = 5

export default function ProofUploadForm({ disbursementId, onSuccess }) {
  const [images, setImages] = useState([]) // array of { url, etag }
  const [submitting, setSubmitting] = useState(false)

  const addSlot = () => {
    if (images.length >= MAX_IMAGES) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh minh chứng`)
      return
    }
    setImages((prev) => [...prev, null]) // null = empty slot
  }

  const removeSlot = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = (index, result) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = result // { url, etag } or null if removed
      return next
    })
  }

  const uploadedImages = images.filter(Boolean)

  const handleSubmit = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 ảnh minh chứng")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      // Send image URLs as JSON array (images already uploaded via ImageUpload)
      formData.append(
        "proofImages",
        JSON.stringify(uploadedImages.map((img) => img.url))
      )

      await uploadProof(disbursementId, formData)
      toast.success("Tải lên minh chứng thành công!")
      setImages([])
      onSuccess?.()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Tải lên minh chứng thất bại"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-primary" />
          Tải lên minh chứng sử dụng quỹ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tải lên ảnh minh chứng chi tiêu (hoá đơn, biên lai, ảnh chụp...).
          Tối đa {MAX_IMAGES} ảnh.
        </p>

        {/* Image slots */}
        <div className="space-y-3">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <ImageUpload
                preview={img?.url || null}
                label={`Ảnh minh chứng ${index + 1}`}
                onUpload={(result) => handleUpload(index, result)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => removeSlot(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add slot button */}
        {images.length < MAX_IMAGES && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSlot}
            className="w-full"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Thêm ảnh ({images.length}/{MAX_IMAGES})
          </Button>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={submitting || uploadedImages.length === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            `Gửi minh chứng (${uploadedImages.length} ảnh)`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
