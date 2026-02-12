import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronsUpDown } from "lucide-react"

export function SearchableSelect({ items, value, onChange, className, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  const filtered = items.filter(i =>
    i.label.toLowerCase().includes(search.toLowerCase())
  )
  const selected = items.find(i => i.value === value)

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      <Button
        variant="outline"
        type="button"
        className="w-full justify-between font-normal"
        onClick={() => { setOpen(!open); setSearch("") }}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-2 text-center text-sm text-muted-foreground">No results</div>
            ) : (
              filtered.map(item => (
                <button
                  key={item.value}
                  type="button"
                  className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${value === item.value ? "bg-accent" : ""}`}
                  onClick={() => { onChange(item.value); setOpen(false) }}
                >
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {value === item.value && <Check className="ml-2 h-4 w-4 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
