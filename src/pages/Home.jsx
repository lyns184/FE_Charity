import { useCampaigns } from "@/hooks/useCampaigns"
import CampaignGrid from "@/components/campaign/CampaignGrid"
import CampaignFilters from "@/components/campaign/CampaignFilters"
import { Button } from "@/components/ui/button"
import { Heart, ArrowDown } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const DEFAULT_STATUS = "ACTIVE,GOAL_REACHED"

export default function Home() {
  const {
    campaigns,
    isLoading,
    search,
    setSearch,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
  } = useCampaigns({ status: DEFAULT_STATUS })

  const scrollToCampaigns = () => {
    document
      .getElementById("campaigns")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  // Build an array of page numbers to render in the pagination bar.
  // Show at most 5 page links centred around the current page.
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = start + maxVisible - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ───────────────── Hero Section ───────────────── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-28 text-center lg:py-40">
        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-teal-100/60 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Heart className="h-8 w-8" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Chung tay vì cộng đồng
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Nền tảng gây quỹ từ thiện minh bạch, tích hợp Blockchain và AI
            để đảm bảo mọi đồng tiền đến đúng nơi cần.
          </p>

          <Button
            size="lg"
            className="mt-4 gap-2"
            onClick={scrollToCampaigns}
          >
            Khám phá chiến dịch
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ───────────── Campaign Section ───────────── */}
      <section id="campaigns" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900">
          Các chiến dịch gây quỹ
        </h2>

        {/* Filters */}
        <div className="mb-8">
          <CampaignFilters
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        {/* Grid */}
        <CampaignGrid campaigns={campaigns} loading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault()
                      prevPage()
                    }}
                    className={
                      page <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault()
                        goToPage(p)
                      }}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault()
                      nextPage()
                    }}
                    className={
                      page >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  )
}
