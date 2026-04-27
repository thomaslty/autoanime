## Why

Even with truncation tooltips (Phase A), users with wide displays cannot expand a column to see all titles at once, and users with narrow displays cannot shrink low-value columns. Adding user-controlled column resizing turns every table into a workspace the user can shape. shadcn does not ship a resizable Table component; we will hand-roll the resize behavior on top of the existing shadcn `Table` rather than migrate to TanStack Table, keeping the diff narrow and avoiding a new dependency.

## What Changes

- Extend `frontend/src/components/ui/table.jsx` with a resize-aware variant: `<TableHead>` gains an optional drag handle on its right edge that changes the column's width.
- Introduce a small `useResizableColumns(tableKey, defaults)` hook that owns column-width state and persists widths to `localStorage` keyed by table identity + column key.
- Apply resizing to the four user-visible tables (`RSSSourcesPage`, `RSSAnimeConfigsPage`, `RSSItemsPage`, `RssConfigFormDialog` preview). The matches dialog stays as-is unless trivial.
- Resizing must coexist with the Phase A truncation tooltips — narrowing a column truncates and tooltips it; widening reveals more text up to the column's content.
- No new npm dependencies. Hand-rolled pointer-event drag handlers only.

## Capabilities

### New Capabilities
- `resizable-table-columns`: User-visible behavior that table column widths can be adjusted via drag handles in the column header, with widths persisted across reloads.

### Modified Capabilities
- `table-truncation-tooltip`: Behavior must remain correct when columns are resized — clipped text continues to surface a tooltip, non-clipped text does too. (Implementation does not change; spec adds a scenario that ties the two behaviors together.)

## Impact

- **Frontend code**: `components/ui/table.jsx` extended; new `frontend/src/hooks/useResizableColumns.js` (or co-located); 4 table consumers updated to declare column keys and minimum widths.
- **No new dependencies.** Pointer events + CSS variables for column widths.
- **Persistence**: `localStorage` only — per-browser, not per-user. Synced-across-devices is an explicit non-goal for this change.
- **No backend, DB, or API changes.**
- **Tests**: Playwright headless tests that drag a column wider/narrower, screenshot before/after, reload, and verify the new width persists.
