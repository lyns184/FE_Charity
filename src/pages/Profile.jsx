import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { updateProfile, changePassword, submitKYC, getMyDonations } from "@/api/user.api"
import KYCStatusBanner from "@/components/kyc/KYCStatusBanner"
import KYCUploadForm from "@/components/kyc/KYCUploadForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { KYC_STATUS } from "@/constants/enums"
import { formatVND, formatDate } from "@/lib/utils"
import { User, Lock, ShieldCheck, Heart, Pencil, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

// ─── Tab 1: Personal Info ────────────────────────────────────────────
function PersonalInfoTab({ user, refreshProfile }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    gender: "",
    dob: "",
    phone: "",
    bio: "",
    address: "",
    socialLinks: "",
  })

  useEffect(() => {
    if (user) {
      setForm({
        gender: user.gender || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        phone: user.phone || "",
        bio: user.bio || "",
        address: user.address || "",
        socialLinks: user.socialLinks || "",
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenderChange = (value) => {
    setForm((prev) => ({ ...prev, gender: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        gender: form.gender || undefined,
        dob: form.dob || undefined,
        phone: form.phone || undefined,
        bio: form.bio || undefined,
        address: form.address || undefined,
        socialLinks: form.socialLinks || undefined,
      }
      await updateProfile(payload)
      toast.success("Cập nhật thông tin thành công")
      setEditing(false)
      await refreshProfile()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Cập nhật thông tin thất bại"
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    if (user) {
      setForm({
        gender: user.gender || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        phone: user.phone || "",
        bio: user.bio || "",
        address: user.address || "",
        socialLinks: user.socialLinks || "",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Thông tin cá nhân
        </CardTitle>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              Lưu
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar & read-only info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator />

        {/* Editable fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Gender */}
          <div className="space-y-2">
            <Label>Giới tính</Label>
            {editing ? (
              <Select value={form.gender} onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm">
                {form.gender === "MALE"
                  ? "Nam"
                  : form.gender === "FEMALE"
                    ? "Nữ"
                    : form.gender === "OTHER"
                      ? "Khác"
                      : "Chưa cập nhật"}
              </p>
            )}
          </div>

          {/* Date of birth */}
          <div className="space-y-2">
            <Label htmlFor="dob">Ngày sinh</Label>
            {editing ? (
              <Input
                id="dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
              />
            ) : (
              <p className="text-sm">
                {form.dob
                  ? new Date(form.dob).toLocaleDateString("vi-VN")
                  : "Chưa cập nhật"}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            {editing ? (
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
              />
            ) : (
              <p className="text-sm">{form.phone || "Chưa cập nhật"}</p>
            )}
          </div>

          {/* Social links */}
          <div className="space-y-2">
            <Label htmlFor="socialLinks">Liên kết xã hội</Label>
            {editing ? (
              <Input
                id="socialLinks"
                name="socialLinks"
                value={form.socialLinks}
                onChange={handleChange}
                placeholder="Facebook, Twitter, ..."
              />
            ) : (
              <p className="text-sm">{form.socialLinks || "Chưa cập nhật"}</p>
            )}
          </div>
        </div>

        {/* Address - full width */}
        <div className="space-y-2">
          <Label htmlFor="address">Địa chỉ</Label>
          {editing ? (
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
            />
          ) : (
            <p className="text-sm">{form.address || "Chưa cập nhật"}</p>
          )}
        </div>

        {/* Bio - full width */}
        <div className="space-y-2">
          <Label htmlFor="bio">Giới thiệu bản thân</Label>
          {editing ? (
            <Textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Viết vài dòng giới thiệu về bạn..."
              rows={4}
            />
          ) : (
            <p className="text-sm">{form.bio || "Chưa cập nhật"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Tab 2: Change Password ──────────────────────────────────────────
function ChangePasswordTab() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    setLoading(true)
    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.success("Đổi mật khẩu thành công")
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      const msg =
        err.response?.data?.message || "Đổi mật khẩu thất bại"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Đổi mật khẩu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={form.oldPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Tab 3: KYC Verification ─────────────────────────────────────────
function KYCTab({ user, refreshProfile }) {
  const [loading, setLoading] = useState(false)
  const kycStatus = user?.kycStatus || KYC_STATUS.NONE

  const handleKYCSubmit = async (formData) => {
    setLoading(true)
    try {
      // formData = { idCardFront: "url", idCardBack: "url", portrait: "url" }
      await submitKYC(formData)
      toast.success("Gửi yêu cầu xác minh thành công! Vui lòng chờ duyệt.")
      await refreshProfile()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gửi yêu cầu xác minh thất bại"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Xác minh danh tính
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <KYCStatusBanner status={kycStatus} />

          {(kycStatus === KYC_STATUS.NONE ||
            kycStatus === KYC_STATUS.REJECTED) && (
            <>
              <Separator />
              <KYCUploadForm
                accountType={user?.accountType}
                onSubmit={handleKYCSubmit}
                isLoading={loading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab 4: Donation History ──────────────────────────────────────────
function DonationHistoryTab() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyDonations({ page, limit: 10 })
      const data = res.data
      setDonations(Array.isArray(data) ? data : data.donations || [])
      if (data.totalPages) setTotalPages(data.totalPages)
      if (data.pagination?.totalPages) setTotalPages(data.pagination.totalPages)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể tải lịch sử đóng góp"
      toast.error(msg)
      setDonations([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Lịch sử đóng góp
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border p-4"
              >
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="py-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Bạn chưa có đóng góp nào.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((donation) => {
              const id = donation._id || donation.id
              return (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium">
                      {donation.campaignTitle || donation.campaign?.title || "Chiến dịch"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(donation.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatVND(donation.amount)}
                    </p>
                    {donation.status && (
                      <p
                        className={`text-xs ${
                          donation.status === "SUCCESS"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {donation.status === "SUCCESS"
                          ? "Thành công"
                          : "Đang xử lý"}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Tiếp
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Main Profile Page ───────────────────────────────────────────────
export default function Profile() {
  const { user, refreshProfile } = useAuth()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Tài khoản của tôi
        </h1>
        <p className="mt-2 text-muted-foreground">
          Quản lý thông tin cá nhân và cài đặt tài khoản
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">
            <User className="mr-1.5 h-4 w-4" />
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="mr-1.5 h-4 w-4" />
            Đổi mật khẩu
          </TabsTrigger>
          <TabsTrigger value="kyc">
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            Xác minh danh tính
          </TabsTrigger>
          <TabsTrigger value="donations">
            <Heart className="mr-1.5 h-4 w-4" />
            Lịch sử đóng góp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <PersonalInfoTab user={user} refreshProfile={refreshProfile} />
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <ChangePasswordTab />
        </TabsContent>

        <TabsContent value="kyc" className="mt-6">
          <KYCTab user={user} refreshProfile={refreshProfile} />
        </TabsContent>

        <TabsContent value="donations" className="mt-6">
          <DonationHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
