import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Renders text that visually truncates with an ellipsis and reveals the full
 * value in a tooltip on hover or focus. Use inside a TableCell for any
 * potentially-long string column.
 *
 * The shadcn `Tooltip` already wraps a `TooltipProvider` internally, so no
 * external provider is required. Pass `tooltip` to override the hover text;
 * by default the displayed children are reused.
 */
export function TruncatedCell({ children, tooltip, className, contentClassName }) {
  const hoverValue = tooltip !== undefined ? tooltip : children
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("cursor-help truncate block", className)}>{children}</span>
      </TooltipTrigger>
      <TooltipContent className={cn("max-w-xs break-all", contentClassName)}>
        {hoverValue}
      </TooltipContent>
    </Tooltip>
  )
}

export default TruncatedCell
