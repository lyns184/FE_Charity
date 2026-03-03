import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getMyCampaigns } from "@/api/user.api"
import { closeCampaign, updateCampaign } from "@/api/campaign.api"
import { useAuth } from "@/hooks/useAuth"
import StatusBadge from "@/components/shared/StatusBadge"
import ProgressBar from "@/components/shared/ProgressBar"
import CampaignForm from "@/components/campaign/CampaignForm"
import EmptyState from "@/components/shared/EmptyState"
import { CardSkeleton } from "@/components/shared/LoadingSkeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CAMPAIGN_STATUS } from "@/constants/enums"
import { FolderHeart, Pencil, XCircle, Banknote } from "lucide-react"
import { toast } from "sonner"

export default function MyCampaigns() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [closingId, setClosingId] = useState(null)
  const [editCampaign, setEditCampaign] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyCampaigns()
      const data = res.data
      setCampaigns(Array.isArray(data) ? data : data.campaigns || [])
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể tải danh sách chiến dịch"
      toast.error(msg)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleClose = async (id) => {
    setClosingId(id)
    try {
      await closeCampaign(id)
      toast.success("Đã đóng chiến dịch thành công")
      fetchCampaigns()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Đóng chiến dịch thất bại"
      toast.error(msg)
    } finally {
      setClosingId(null)
    }
  }

  const handleEdit = (campaign) => {
    setEditCampaign(campaign)
    setEditDialogOpen(true)
  }

  const handleUpdate = async (data) => {
    if (!editCampaign) return
    setUpdateLoading(true)
    try {
      const id = editCampaign._id || editCampaign.id
      await updateCampaign(id, data)
      toast.success("Cập nhật chiến dịch thành công")
      setEditDialogOpen(false)
      setEditCampaign(null)
      fetchCampaigns()
    } catch (err) {
      const msg =
        err.response?.data?.message || "Cập nhật chiến dịch thất bại"
      toast.error(msg)
    } finally {
      setUpdateLoading(false)
    }
  }

  const filterByStatus = (status) => {
    if (!status) return campaigns
    return campaigns.filter((c) => c.status === status)
  }

  const renderCampaignCard = (campaign) => {
    const id = campaign._id || campaign.id
    const imageUrl =
      typeof campaign.image === "string"
        ? campaign.image
        : campaign.image?.url || null

    return (
      <Card key={id} className="overflow-hidden">
        {/* Campaign Image */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={campaign.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FolderHeart className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <StatusBadge status={campaign.status} type="campaign" />
          </div>
        </div>

        <CardContent className="space-y-4 p-4">
          {/* Title */}
          <Link
            to={`/campaign/${id}`}
            className="line-clamp-2 text-base font-semibold hover:underline"
          >
            {campaign.title}
          </Link>

          {/* Progress */}
          <ProgressBar
            current={campaign.currentBalance ?? campaign.currentAmount ?? 0}
            goal={campaign.goalAmount || 0}
          />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Edit button for ACTIVE and PENDING */}
            {(campaign.status === CAMPAIGN_STATUS.ACTIVE ||
              campaign.status === CAMPAIGN_STATUS.PENDING) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(campaign)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Chỉnh sửa
              </Button>
            )}

            {/* Close button for ACTIVE */}
            {campaign.status === CAMPAIGN_STATUS.ACTIVE && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={closingId === id}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Đóng chiến dịch
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Đóng chiến dịch?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn đóng chiến dịch này? Hành động này
                      không thể hoàn tác. Các khoản đóng góp sẽ được xử lý theo
                      chính sách của nền tảng.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleClose(id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Đóng chiến dịch
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Disburse button for GOAL_REACHED */}
            {campaign.status === CAMPAIGN_STATUS.GOAL_REACHED && (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/my-campaigns/${id}/disburse`)}
              >
                <Banknote className="mr-1.5 h-3.5 w-3.5" />
                Yêu cầu giải ngân
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTabContent = (status) => {
    const filtered = filterByStatus(status)

    if (loading) {
      return <CardSkeleton count={3} />
    }

    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={FolderHeart}
          title="Không có chiến dịch"
          description={
            status
              ? "Không có chiến dịch nào trong trạng thái này."
              : "Bạn chưa tạo chiến dịch nào. Hãy bắt đầu tạo chiến dịch đầu tiên!"
          }
          action={
            !status && !isAdmin && (
              <Button onClick={() => navigate("/campaigns/create")}>
                Tạo chiến dịch
              </Button>
            )
          }
        />
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(renderCampaignCard)}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Chiến dịch của tôi
          </h1>
          <p className="mt-1 text-muted-foreground">
            Quản lý các chiến dịch gây quỹ của bạn
          </p>
        </div>
{!isAdmin && (
          <Button onClick={() => navigate("/campaigns/create")}>
            Tạo chiến dịch
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="closed">Đã đóng</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderTabContent(null)}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {renderTabContent(CAMPAIGN_STATUS.ACTIVE)}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {renderTabContent(CAMPAIGN_STATUS.PENDING)}
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          {renderTabContent(CAMPAIGN_STATUS.CLOSED)}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chiến dịch</DialogTitle>
          </DialogHeader>
          {editCampaign && (
            <CampaignForm
              initialData={editCampaign}
              onSubmit={handleUpdate}
              isLoading={updateLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
