import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold text-lg">ThienNguyen</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Nền tảng gây quỹ từ thiện minh bạch – Tích hợp Blockchain và AI
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            &copy; {new Date().getFullYear()} ThienNguyen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
