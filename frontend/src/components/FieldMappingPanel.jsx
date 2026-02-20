import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const TARGET_FIELDS = [
  { key: 'title', label: 'Title', recommended: true },
  { key: 'link', label: 'Link' },
  { key: 'magnetLink', label: 'Magnet Link', recommended: true },
  { key: 'publishedDate', label: 'Published Date' },
  { key: 'description', label: 'Description' },
  { key: 'author', label: 'Author' },
  { key: 'category', label: 'Category' },
  { key: 'guid', label: 'GUID' },
]

/**
 * Panel showing target DB fields and their XML path assignments.
 *
 * Props:
 *  mappings        - { title: "title", magnetLink: "enclosure.@_url", ... }
 *  onMappingChange - (field, path|null) => void
 *  activeField     - which field is currently waiting for tree click
 *  onFieldSelect   - (field) => void
 */
export function FieldMappingPanel({ mappings, onMappingChange, activeField, onFieldSelect }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-3">
        Click a field to activate it, then click a node in the XML tree to assign.
      </p>
      {TARGET_FIELDS.map(field => {
        const mapped = mappings?.[field.key]
        const isActive = activeField === field.key

        return (
          <div
            key={field.key}
            className={[
              "flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors",
              isActive
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-muted-foreground/50 hover:bg-muted/30",
            ].join(' ')}
            onClick={() => onFieldSelect(field.key)}
          >
            {/* Label */}
            <div className="flex items-center gap-1 min-w-[110px]">
              {field.recommended && (
                <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />
              )}
              <span className="text-sm font-medium">{field.label}</span>
            </div>

            {/* Mapped path or placeholder */}
            <div className="flex-1 min-w-0">
              {mapped ? (
                <Badge variant="secondary" className="font-mono text-xs max-w-full truncate">
                  {mapped}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  {isActive ? "Click a tree node to assign…" : "Not assigned"}
                </span>
              )}
            </div>

            {/* Clear button */}
            {mapped && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onMappingChange(field.key, null)
                }}
                title="Clear mapping"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
