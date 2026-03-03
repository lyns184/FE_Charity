import { Card, CardContent } from "@/components/ui/card"
import { Users, FolderOpen, HandCoins, ShieldCheck } from "lucide-react"
import { formatVND } from "@/lib/utils"

const stats = [
  {
    key: "totalUsers",
    label: "Người dùng",
    icon: Users,
    color: "text-blue-600 bg-blue-100",
    format: (v) => v ?? 0,
  },
  {
    key: "totalCampaigns",
    label: "Chiến dịch",
    icon: FolderOpen,
    color: "text-emerald-600 bg-emerald-100",
    format: (v) => v ?? 0,
  },
  {
    key: "totalDonations",
    label: "Tổng quyên góp",
    icon: HandCoins,
    color: "text-amber-600 bg-amber-100",
    format: (v) => formatVND(v ?? 0),
  },
  {
    key: "pendingKYC",
    label: "KYC chờ duyệt",
    icon: ShieldCheck,
    color: "text-violet-600 bg-violet-100",
    format: (v) => v ?? 0,
  },
]

export default function AdminStatsCards({ data = {} }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ key, label, icon: Icon, color, format }) => (
        <Card key={key} className="py-4">
          <CardContent className="flex items-center gap-4 px-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-xl font-bold truncate">{format(data[key])}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
