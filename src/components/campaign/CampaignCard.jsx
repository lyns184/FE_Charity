import { Link } from "react-router-dom"
import { Clock, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import StatusBadge from "@/components/shared/StatusBadge"
import ProgressBar from "@/components/shared/ProgressBar"
import { daysRemaining } from "@/lib/utils"

export default function CampaignCard({ campaign }) {
  const remaining = daysRemaining(campaign.endDate)

  return (
    <Link to={`/campaigns/${campaign._id}`} className="block">
      <Card className="py-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {campaign.image ? (
            <img
              src={campaign.image}
              alt={campaign.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-sm">Không có hình ảnh</span>
            </div>
          )}
          {/* Status badge overlay */}
          <div className="absolute top-2 left-2">
            <StatusBadge status={campaign.status} type="campaign" />
          </div>
        </div>

        {/* Content */}
        <CardContent className="space-y-3 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight">
            {campaign.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {campaign.description}
          </p>

          {/* Progress */}
          <ProgressBar
            current={campaign.currentBalance ?? campaign.currentAmount ?? 0}
            goal={campaign.goalAmount}
          />

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Còn {remaining} ngày</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span className="truncate max-w-[120px]">
                {campaign.creatorId?.name || campaign.createdBy?.name || "Ẩn danh"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
