import { useState, useEffect, useCallback } from "react"
import { getCampaigns } from "@/api/campaign.api"
import {
  transferDisbursement,
  verifyDisbursement,
} from "@/api/admin.api"
import DisbursementManageCard from "@/components/admin/DisbursementManageCard"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Wallet, Inbox } from "lucide-react"
import { DISBURSEMENT_STATUS } from "@/constants/enums"
import { toast } from "sonner"

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: DISBURSEMENT_STATUS.PENDING_TRANSFER, label: "Chờ chuyển" },
  { value: DISBURSEMENT_STATUS.PENDING_VERIFY, label: "Chờ xác minh" },
  { value: DISBURSEMENT_STATUS.COMPLETED, label: "Hoàn tất" },
  { value: DISBURSEMENT_STATUS.REJECTED, label: "Từ chối" },
]

export default function DisbursementManagement() {
  const [disbursements, setDisbursements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")

  const fetchDisbursements = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch all campaigns and extract disbursements from each
      const res = await getCampaigns({ limit: 200 })
      const campaignList = res.data.campaigns ?? res.data ?? []

      const allDisbursements = []
      for (const campaign of campaignList) {
        const disbursementList =
          campaign.disbursements ?? campaign.disbursementRequests ?? []
        for (const d of disbursementList) {
          allDisbursements.push({
            ...d,
            campaignId: campaign._id,
            campaignTitle: campaign.title,
          })
        }
      }

      setDisbursements(allDisbursements)
    } catch {
      toast.error("Không thể tải danh sách giải ngân")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDisbursements()
  }, [fetchDisbursements])

  // Filter
  const filtered =
    statusFilter === "ALL"
      ? disbursements
      : disbursements.filter((d) => d.status === statusFilter)

  // --- Action handlers ---
  const handleTransfer = async (disbursement, txHash) => {
    try {
      await transferDisbursement(disbursement._id, { txHash })
      toast.success("Đã chuyển tiền thành công")
      fetchDisbursements()
    } catch {
      toast.error("Chuyển tiền thất bại")
    }
  }

  const handleVerify = async (disbursement) => {
    try {
      await verifyDisbursement(disbursement._id, { status: "COMPLETED" })
      toast.success("Đã xác minh giải ngân thành công")
      fetchDisbursements()
    } catch {
      toast.error("Xác minh giải ngân thất bại")
    }
  }

  const handleReject = async (disbursement, reason) => {
    try {
      await verifyDisbursement(disbursement._id, {
        status: "REJECTED",
        rejectionReason: reason,
      })
      toast.success("Đã từ chối giải ngân")
      fetchDisbursements()
    } catch {
      toast.error("Từ chối giải ngân thất bại")
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Quản lý giải ngân</h1>
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Không có yêu cầu giải ngân"
          description={
            statusFilter === "ALL"
              ? "Chưa có yêu cầu giải ngân nào trong hệ thống."
              : `Không có yêu cầu giải ngân nào ở trạng thái "${
                  STATUS_OPTIONS.find((o) => o.value === statusFilter)
                    ?.label ?? statusFilter
                }".`
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((disbursement) => (
            <DisbursementManageCard
              key={disbursement._id}
              disbursement={disbursement}
              onTransfer={handleTransfer}
              onVerify={handleVerify}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
