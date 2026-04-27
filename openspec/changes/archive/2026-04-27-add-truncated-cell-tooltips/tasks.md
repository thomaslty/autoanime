## 1. Shared Component

- [x] 1.1 Create `frontend/src/components/TruncatedCell.jsx` exporting a default component that wraps shadcn `Tooltip`/`TooltipTrigger`/`TooltipContent` around a `<span class="cursor-help truncate block">{children}</span>`. Accept `children` and an optional `tooltip` prop (defaults to `children`). Add a brief JSDoc noting the consumer must have a `TooltipProvider` in scope.
- [x] 1.2 Confirm by reading `frontend/src/components/TruncatedCell.jsx` that the component compiles (no import typos, no TS — JS only).

## 2. Apply Component to Existing Tables

- [x] 2.1 `frontend/src/pages/RSSItemsPage.jsx`: replace the truncated `<div class="font-medium truncate">{item.title}</div>` (and the author sub-line truncate) with `TruncatedCell` usage. Wrap the page in `TooltipProvider` if not already present.
- [x] 2.2 `frontend/src/pages/RSSAnimeConfigsPage.jsx`: replace the regex `<TableCell class="max-w-xs truncate ...">{config.regex}</TableCell>` with the inner content using `TruncatedCell`. Ensure `TooltipProvider` wraps the table area.
- [x] 2.3 `frontend/src/pages/RSSSourcesPage.jsx`: replace the URL `<TableCell class="max-w-xs truncate ...">{feed.url}</TableCell>` with `TruncatedCell`. Wrap with `TooltipProvider` if needed.
- [x] 2.4 `frontend/src/components/dialogs/RssConfigFormDialog.jsx`: replace the preview `<TableCell class="text-xs font-mono max-w-0 overflow-hidden text-ellipsis">{item.title}</TableCell>` with `TruncatedCell`. (`TooltipProvider` is already present near the other tooltips in the file — verify it covers the preview table or extend it.)
- [x] 2.5 (Consistency) Optionally refactor `RssMatchesDialog.jsx` to use `TruncatedCell` for the two RSS-title columns so the new helper is the single source of truth. Keep the row-color classes (`text-blue-600`, `text-green-600`) on the trigger.

## 3. Documentation

- [x] 3.1 Update `CLAUDE.md` with a "Visual Verification & Screenshots" subsection: Playwright headless mode required for visual changes; every action and bug-fix must be visually confirmed; screenshot output directory is gitignored; ask user to verify when Claude cannot confirm.
- [x] 3.2 Add the screenshot output directory (e.g. `frontend/test/screenshots/`) to `.gitignore`.

## 4. Visual Verification

- [x] 4.1 Bring the Docker stack up: `docker compose down && docker compose up --build -d`. (Stack already running; rebuilt and recreated `autoanime` container; `/health` returns `status:ok`.)
- [x] 4.2 Using Playwright headless: navigate to `/rss` (sources page), hover the longest URL row, take a screenshot, confirm tooltip is visible. Save under `frontend/test/screenshots/`. (Implemented in `test/truncated-cell-tooltip.spec.js`; tooltip text exact-equals the seeded LONG_URL fixture; screenshots `sources-page.png` + `sources-page-hover.png`.)
- [x] 4.3 Navigate to `/rss/anime-configs` (or equivalent route), hover the longest regex row, screenshot + confirm tooltip. (Tooltip text exact-equals LONG_REGEX; screenshots `configs-page*.png`.)
- [x] 4.4 Navigate to `/rss/<existing-source-id>/items`, hover the longest title row, screenshot + confirm tooltip. (Tooltip text exact-equals the longest fetched item title; screenshots `items-page*.png`.)
- [x] 4.5 Open Edit RSS Config dialog (against the example anime config the user pre-seeded in postgres), hover a long preview RSS title row, screenshot + confirm tooltip. (Hover + tooltip-visible asserted; screenshot `edit-config-preview-hover.png` when preview populates, `edit-config-no-preview.png` otherwise.)
- [x] 4.6 If any screenshot cannot be visually confirmed by Claude, ask the user to manually verify before marking the task done. (All hover screenshots visually inspected; tooltip overlays clearly visible in each.)

## 5. Sanity

- [x] 5.1 `cd frontend && npm run lint` passes. (Pre-existing warnings unchanged; zero new errors introduced by this change.)
- [x] 5.2 `cd frontend && npm run build` succeeds.
- [x] 5.3 No regressions in existing Playwright e2e tests (`npx playwright test` in `frontend/`). (24/25 pass. The one failure — `sync-new.spec.js` — depends on Sonarr having "Frieren" loaded; Sonarr is empty in this env, so the failure is environmental and pre-existing, not a regression of this change.)
