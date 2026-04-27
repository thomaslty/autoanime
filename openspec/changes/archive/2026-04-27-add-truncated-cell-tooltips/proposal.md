## Why

Several tables in the app truncate long text (RSS titles, regex patterns, URLs) without surfacing the full value to the user. The user cannot read the truncated content without inspecting the DOM. The pattern already exists in `RssMatchesDialog.jsx` — this proposal propagates it to the remaining tables and codifies it as a reusable component so future tables can't regress.

## What Changes

- Add hover tooltips that show the full text when a table cell is truncated, applied to every table in the frontend that currently truncates content.
- Introduce a small `TruncatedCell` (or equivalent) shared component built on existing shadcn `Tooltip` primitives so the pattern is one import away.
- Fix the four currently-affected cells:
  - `RssConfigFormDialog.jsx` — preview table "RSS Title" column
  - `RSSItemsPage.jsx` — "Title" column (and author sub-line)
  - `RSSAnimeConfigsPage.jsx` — "Regex" column
  - `RSSSourcesPage.jsx` — "URL" column
- Document the Playwright-headless + screenshot test convention in `CLAUDE.md` (gitignored screenshot directory, every visual change must be visually confirmed, ask the user when Claude cannot confirm).

## Capabilities

### New Capabilities
- `table-truncation-tooltip`: User-visible behavior that any table cell which visually clips its text shows a hover tooltip containing the full value.

### Modified Capabilities
<!-- None — no existing specs in openspec/specs/ -->

## Impact

- **Frontend code**: 4 page/dialog files updated; new shared component under `frontend/src/components/`.
- **No new dependencies** — uses existing shadcn `Tooltip` primitives already imported elsewhere.
- **No backend, DB, or API changes.**
- **Docs**: `CLAUDE.md` gains a "Visual Verification & Screenshots" subsection.
- **Tests**: Playwright headless screenshot verification of each fixed table; screenshot output directory added to `.gitignore`.
