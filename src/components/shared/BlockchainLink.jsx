import { ExternalLink } from "lucide-react"
import { cn, shortHash, getEtherscanUrl } from "@/lib/utils"
import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton"

export default function BlockchainLink({ txHash, className }) {
  if (!txHash) return null

  const url = getEtherscanUrl(txHash)

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-sm text-primary hover:underline"
      >
        {shortHash(txHash)}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <CopyToClipboardButton text={txHash} />
    </div>
  )
}
