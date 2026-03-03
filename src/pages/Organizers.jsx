import { useState, useEffect } from "react"
import { getOrganizers } from "@/api/user.api"
import { ACCOUNT_TYPE } from "@/constants/enums"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/shared/EmptyState"
import { Users, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

function OrganizerCardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Organizers() {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("ALL")

  useEffect(() => {
    const fetchOrganizers = async () => {
      setLoading(true)
      try {
        const params = { limit: 20 }
        if (typeFilter !== "ALL") {
          params.type = typeFilter
        }
        const res = await getOrganizers(params)
        const data = res.data
        setOrganizers(Array.isArray(data) ? data : data.organizers || [])
      } catch (err) {
        const msg =
          err.response?.data?.message || "Không thể tải danh sách tổ chức"
        toast.error(msg)
        setOrganizers([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizers()
  }, [typeFilter])

  const getAccountTypeLabel = (type) => {
    if (type === ACCOUNT_TYPE.ORGANIZATION) return "Tổ chức"
    if (type === ACCOUNT_TYPE.INDIVIDUAL) return "Cá nhân"
    return type
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Tổ chức & Cá nhân
        </h1>
        <p className="mt-2 text-muted-foreground">
          Những tổ chức và cá nhân đã được xác minh trên nền tảng
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại tài khoản" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value={ACCOUNT_TYPE.ORGANIZATION}>Tổ chức</SelectItem>
            <SelectItem value={ACCOUNT_TYPE.INDIVIDUAL}>Cá nhân</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <OrganizerCardSkeleton count={6} />
      ) : organizers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy kết quả"
          description="Hiện tại chưa có tổ chức hoặc cá nhân nào phù hợp với bộ lọc của bạn."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizers.map((org) => (
            <Card key={org._id || org.id} className="overflow-hidden">
              <CardContent className="flex flex-col items-center p-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={org.avatar} alt={org.name} />
                  <AvatarFallback className="text-xl">
                    {org.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <h3 className="mt-4 text-center font-semibold">{org.name}</h3>

                <Badge variant="secondary" className="mt-2">
                  {getAccountTypeLabel(org.accountType)}
                </Badge>

                {org.bio && (
                  <p className="mt-3 line-clamp-3 text-center text-sm text-muted-foreground">
                    {org.bio}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-1.5 text-sm text-green-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Đã xác minh</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
