import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { KYC_STATUS } from "@/constants/enums"
import { AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react"

const STATUS_CONFIG = {
  [KYC_STATUS.NONE]: {
    icon: AlertTriangle,
    title: "Chưa xác minh",
    message: "Bạn chưa xác minh danh tính. Hãy xác minh để tạo chiến dịch.",
    className:
      "border-yellow-500/50 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200 [&>svg]:text-yellow-600",
  },
  [KYC_STATUS.PENDING]: {
    icon: Clock,
    title: "Đang xử lý",
    message: "Yêu cầu xác minh đang được xử lý.",
    className:
      "border-blue-500/50 bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200 [&>svg]:text-blue-600",
  },
  [KYC_STATUS.APPROVED]: {
    icon: CheckCircle2,
    title: "Đã xác minh",
    message: "Danh tính đã được xác minh.",
    className:
      "border-green-500/50 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-200 [&>svg]:text-green-600",
  },
  [KYC_STATUS.REJECTED]: {
    icon: XCircle,
    title: "Bị từ chối",
    message: "Yêu cầu xác minh bị từ chối. Vui lòng thử lại.",
    className:
      "border-red-500/50 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200 [&>svg]:text-red-600",
  },
}

export default function KYCStatusBanner({ status }) {
  const config = STATUS_CONFIG[status]

  if (!config) return null

  const Icon = config.icon

  return (
    <Alert className={config.className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>{config.message}</AlertDescription>
    </Alert>
  )
}
