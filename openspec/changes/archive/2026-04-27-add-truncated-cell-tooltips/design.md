## Context

The frontend already has shadcn `Tooltip` primitives (`@/components/ui/tooltip`) and uses them inside `RssMatchesDialog.jsx:225-251` to surface full RSS titles when cells truncate. Four other tables truncate text (`max-w-xs truncate` or `max-w-0 overflow-hidden text-ellipsis`) without tooltips. There is no shared helper for this pattern, so each table reimplements the same JSX or — as in the four current cases — forgets the tooltip entirely.

## Goals / Non-Goals

**Goals:**
- Any truncated text in a table cell reveals its full value on hover (mouse) or focus (keyboard).
- Codify the pattern as a single component so future tables stay consistent.
- Zero new dependencies — reuse existing shadcn Tooltip.

**Non-Goals:**
- Resizable columns (handled in Phase B, separate change `add-resizable-table-columns`).
- Showing tooltips on cells whose text is **not** clipped (out of scope; explicitly accept always-on tooltips for simplicity unless overflow detection comes for free).
- Refactoring tables to TanStack Table or any other framework.
- Mobile-specific long-press tooltip UX — desktop hover/focus is sufficient.

## Decisions

### 1. Reusable component: `TruncatedCell`

Single component placed at `frontend/src/components/TruncatedCell.jsx`. Wraps shadcn `Tooltip` with a `<span class="cursor-help truncate block">` trigger and a `<TooltipContent>` containing the full value. Accepts `children` (the displayed value) and `tooltip` (full value, defaults to `children`).

**Why a component, not a hook**: the JSX is repetitive enough that a helper saves real lines and prevents tooltip drift. A hook wouldn't reduce JSX volume.

**Why not modify `TableCell` itself**: most cells don't truncate. Forcing tooltip wiring on every cell is intrusive and would require an opt-in prop anyway, defeating the simplicity.

**Alternative considered**: add a `truncate` prop to `TableCell`. Rejected — it conflates `td` with tooltip behavior and breaks shadcn's "primitives-only" convention.

### 2. Always-on tooltip vs overflow-detection-only

**Decision**: always-on. If the user hovers a short title, the tooltip just repeats it — harmless. Overflow detection requires `useResizeObserver` or measuring `scrollWidth > clientWidth` and adds complexity for little gain.

### 3. `TooltipProvider` placement

Already wrapped at app/dialog level in current usages. `TruncatedCell` will not embed its own provider; consumers must have one in scope (matches existing convention from `RssConfigFormDialog.jsx`). If a consumer lacks one, the tooltip silently no-ops — acceptable because all current and planned tables sit inside dialogs/pages that already wrap providers.

### 4. Visual styling

Match the existing pattern: `cursor-help`, `truncate`, `block`. Tooltip content uses `max-w-xs` to keep long titles wrapped to readable width. No color change for trigger text — the user reads "blue/green" in `RssMatchesDialog` because those rows have semantic colors (current vs new match), which is row-specific styling, not a tooltip concern.

## Risks / Trade-offs

- **Risk**: tooltip on every truncated cell may feel chatty when text is short → **Mitigation**: keep delay default; users only see it if they linger. Acceptable trade for simplicity.
- **Risk**: `TooltipProvider` missing in some future table → **Mitigation**: documented in component JSDoc; tooltip degrades gracefully (renders text without tooltip).
- **Trade-off**: not detecting overflow means redundant tooltips on short titles. Accepted in exchange for ~20 LOC saved.

## Migration Plan

No migration. Pure additive frontend change. Rollback = revert the commit.
