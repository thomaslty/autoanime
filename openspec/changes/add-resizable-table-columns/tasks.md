## 1. Foundations

- [ ] 1.1 Create `frontend/src/hooks/useResizableColumns.js` exporting `useResizableColumns(tableKey, defaults)` returning `{ widths, getThProps(columnKey), resetColumn(columnKey) }`. Initialize state synchronously from `localStorage.getItem("table:" + tableKey + ":widths")` to prevent first-paint flash. Persist on commit (debounced).
- [ ] 1.2 Define `MIN_WIDTH = 60` constant in the hook (or accept per-column overrides via the `defaults` map).
- [ ] 1.3 Unit-style sanity in dev: log a warning if the same `tableKey` is used by two mounted hooks (catches copy-paste bugs).

## 2. Table primitive extension

- [ ] 2.1 In `frontend/src/components/ui/table.jsx`, add a `ResizeHandle` subcomponent rendered at the right edge of any `<TableHead>` that opts in. Use pointer events (`onPointerDown` + `setPointerCapture`) for the drag. `e.stopPropagation()` on pointerdown to prevent sort handlers.
- [ ] 2.2 When a column has a stored width, apply `style={{ width, minWidth: width, maxWidth: width }}` on the `<th>` and switch the surrounding `<table>` to `table-layout: fixed`. Keep `auto` layout for tables that haven't opted in.
- [ ] 2.3 Add double-click handler on the resize handle that calls `resetColumn(columnKey)`.
- [ ] 2.4 Style the handle: 4–6px wide, `cursor: col-resize`, faint at rest, more visible on hover, taller hit-target than visible target if needed.

## 3. Migrate consumer tables

- [ ] 3.1 `frontend/src/pages/RSSSourcesPage.jsx`: declare column keys + defaults, call `useResizableColumns("rss-sources", {...})`, spread `getThProps(key)` on each `<TableHead>`.
- [ ] 3.2 `frontend/src/pages/RSSAnimeConfigsPage.jsx`: same with key `"rss-anime-configs"`.
- [ ] 3.3 `frontend/src/pages/RSSItemsPage.jsx`: same with key `"rss-items"`.
- [ ] 3.4 `frontend/src/components/dialogs/RssConfigFormDialog.jsx` (preview table): same with key `"rss-config-preview"`.
- [ ] 3.5 (Optional) `RssMatchesDialog.jsx`: only if it falls out for free; otherwise leave alone.

## 4. Visual verification (Playwright headless)

- [ ] 4.1 `docker compose down && docker compose up --build -d`.
- [ ] 4.2 New test `frontend/test/resizable-columns.spec.js`: navigate to `/rss/<source-id>/items`, screenshot before, drag the Title column 100px wider via pointer events, screenshot after, assert the column header's width changed.
- [ ] 4.3 In the same test: reload the page, screenshot, assert the resized width persisted.
- [ ] 4.4 Drag the column narrower until truncation kicks in, hover a row, screenshot, assert the truncation tooltip appears (Phase A coexistence check).
- [ ] 4.5 Repeat the resize+persist screenshot pair for `RSSSourcesPage` and `RSSAnimeConfigsPage`.
- [ ] 4.6 Open Edit RSS Config dialog (using user's pre-seeded data), resize a preview column, screenshot. (Persistence inside a transient dialog is acceptable but expected.)
- [ ] 4.7 If any visual claim cannot be confirmed by Claude from screenshots, ask the user to verify before checking the task off.

## 5. Sanity

- [ ] 5.1 `cd frontend && npm run lint` passes.
- [ ] 5.2 `cd frontend && npm run build` succeeds.
- [ ] 5.3 Existing Playwright e2e tests still pass (`npx playwright test`).
- [ ] 5.4 Manually confirm the existing sort-header click behavior was not regressed by the resize handle — clicking the handle does NOT toggle sort.
