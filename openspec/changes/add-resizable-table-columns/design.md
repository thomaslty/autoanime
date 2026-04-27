## Context

The app's tables are rendered with the shadcn `Table`/`TableHeader`/`TableHead` primitives in `frontend/src/components/ui/table.jsx`. There are 4–5 consumer tables. shadcn provides no resize affordance; the only "resizable" shadcn component is `react-resizable-panels`, which is for split-pane layouts, not column widths. The user has chosen the hand-rolled approach over adopting TanStack Table to avoid the refactor of all consumer tables and a new dependency.

Phase A (`add-truncated-cell-tooltips`) introduces a `TruncatedCell` helper. Phase B must compose with it: when a user drags a column narrower, more cells will start clipping and the tooltip should keep working transparently.

## Goals / Non-Goals

**Goals:**
- Drag-to-resize column widths from the header row, with a visible grab handle that hints affordance.
- Persist column widths in `localStorage` keyed by `(tableKey, columnKey)`.
- Restore widths on reload.
- Sensible minimum width (e.g. 60px) to prevent users from collapsing a column to zero.
- Optional double-click on the handle to "reset to default" for that column.
- No new dependencies.

**Non-Goals:**
- Server-side / cross-device persistence (localStorage only).
- Reordering columns.
- Auto-fit-to-content.
- Mobile/touch resize gestures (best-effort: pointer events handle touch but UX is desktop-first).
- Resizing inside `RssMatchesDialog.jsx` unless it falls out for free.
- Column hiding/showing.

## Decisions

### 1. Hand-rolled vs TanStack Table

**Chosen**: hand-rolled.

**Why**: TanStack would force every table to be rewritten as `columns: ColumnDef[]` + `useReactTable(...)`. The current tables have rich JSX in cells (badges, action buttons, sortable headers). The migration cost dwarfs the benefit for *just* resize. Hand-rolled keeps each consumer's JSX intact and adds ~100 LOC across `table.jsx` + a hook.

**Alternative considered**: TanStack Table with `enableColumnResizing`. Rejected for the diff-size reason above. Worth revisiting if/when filtering+pagination+resizing all land together.

### 2. State model

A `useResizableColumns(tableKey, defaults)` hook returns:
- `widths: Record<columnKey, number>` — current pixel widths, hydrated from localStorage on mount.
- `getThProps(columnKey)` — spreadable props for the `<TableHead>`, providing `style={{ width: widths[columnKey] }}` and the resize handle.
- `resetColumn(columnKey)` — restore default.
- `resetAll()` — wipe persisted widths.

The hook persists on every commit via a debounced `localStorage.setItem(\`table:\${tableKey}:widths\`, JSON.stringify(widths))`.

**Why a hook**: each table's columns differ; the hook gives each consumer its own state without prop drilling.

**Alternative considered**: a context provider per table. Rejected — adds nesting, and column-width state never needs to be read by descendants beyond the header itself.

### 3. Drag mechanics

- Use **pointer events** (`onPointerDown`/`onPointerMove`/`onPointerUp` with `setPointerCapture`) on a small `<div>` absolutely positioned at the right edge of the `<th>`. Width: 4–6px, cursor: `col-resize`, faintly visible on hover.
- Track `startX` and `startWidth` on pointerdown; on pointermove, set `width = max(MIN_WIDTH, startWidth + (event.clientX - startX))`.
- Keep state internal to a React `useRef` during the drag and only commit to the hook's state on pointerup, to avoid re-rendering the entire table on every pixel.

**Why pointer events**: covers mouse + pen + touch with one path; `setPointerCapture` keeps the drag alive even if the cursor leaves the handle, which is the bug everyone hits with mousemove-on-document.

### 4. Width application

On the `<TableHead>` we apply `style={{ width, minWidth: width, maxWidth: width }}`. On `<TableCell>` we don't need to set width explicitly — `<table>` shares column widths with `table-layout: fixed`. We will switch the `<table>` to `table-layout: fixed` only when at least one column has a stored width; otherwise keep the current `auto` layout to avoid regressing existing tables.

**Alternative considered**: `<colgroup>` with `<col>` per column. Rejected — `colgroup` requires an extra structural element per consumer and offers nothing pointer-events can't.

### 5. Reset UX

Double-click on the resize handle resets that column to its default width (and clears its localStorage entry). No "reset all" UI surfaced in this change — can be added later if requested.

### 6. Persistence key shape

`localStorage.getItem("table:" + tableKey + ":widths")` → JSON `{ columnKey: pixels }`. Stale columns (renamed/removed) are ignored on read; never deleted automatically. **Why localStorage**: per-browser is exactly the granularity column widths want.

### 7. Coexistence with Phase A tooltips

`TruncatedCell` already truncates with CSS regardless of the `<td>` width. Resizing changes the width; truncation behavior re-evaluates automatically because it's CSS-driven. No code coupling needed. Add a regression test to confirm.

## Risks / Trade-offs

- **Risk**: Pointer-event drag crossing iframe / dialog backdrop boundaries → **Mitigation**: `setPointerCapture` and a global `pointerup` listener as belt-and-suspenders.
- **Risk**: Sortable header click conflicting with resize handle click → **Mitigation**: handle is a separate child element with `e.stopPropagation()` on pointerdown so it doesn't trigger sort.
- **Risk**: First-paint flash where columns render at default width before localStorage is read → **Mitigation**: read localStorage synchronously in the hook's initial state (not in `useEffect`).
- **Trade-off**: hand-rolled means we'll never get TanStack's filtering/virtualization for free. If those land later, we may end up rewriting anyway. Accepted.
- **Trade-off**: `table-layout: fixed` can clip content of un-truncated cells with very long words. Phase A's `TruncatedCell` handles the obvious cases; non-text cells (action buttons) are unaffected.

## Migration Plan

Pure additive frontend change. Existing tables behave identically until they opt in to `useResizableColumns`. Rollback = revert the commit; localStorage entries become orphaned but harmless.

## Open Questions

- Should the resize handle be visible at rest, or only on header hover? Default to hover-only for cleanness; revisit if discoverability is poor.
- Do we need a "Reset column widths" menu item somewhere globally? Defer until a user asks.
