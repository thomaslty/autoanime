# table-truncation-tooltip Specification

## Purpose
TBD - created by archiving change add-truncated-cell-tooltips. Update Purpose after archive.
## Requirements
### Requirement: Truncated table cells reveal full text on hover

When a table cell visually clips its text (via CSS `truncate` or `text-ellipsis`), the system SHALL display the full text in a tooltip when the user hovers the cell with a mouse, or focuses it with the keyboard.

#### Scenario: Long RSS title in items page
- **WHEN** the user opens `/rss/<id>/items` and a row's title is longer than the column width
- **THEN** the displayed cell shows the truncated title with an ellipsis
- **AND** hovering the cell reveals a tooltip containing the complete, unmodified title
- **AND** moving the pointer away dismisses the tooltip

#### Scenario: Long RSS title in Edit RSS Config preview
- **WHEN** the user opens the Edit RSS Config dialog and the preview table contains an RSS item title longer than the column
- **THEN** hovering the row's RSS Title cell reveals a tooltip with the full title

#### Scenario: Long regex in anime configs page
- **WHEN** the user views `RSSAnimeConfigsPage` and a config's regex is longer than the column
- **THEN** hovering the regex cell reveals a tooltip with the complete regex string

#### Scenario: Long URL in sources page
- **WHEN** the user views `RSSSourcesPage` and a feed's URL is longer than the column
- **THEN** hovering the URL cell reveals a tooltip with the complete URL

#### Scenario: Short text still works
- **WHEN** a cell's text is short enough that no truncation occurs
- **THEN** hovering the cell still shows a tooltip containing that text
- **AND** layout is unchanged (no extra spacing, no shifted rows)

### Requirement: Reusable shared component

The codebase SHALL expose a single shared component that encapsulates the truncate-with-tooltip behavior, so future tables can adopt it with one import and cannot accidentally omit the tooltip.

#### Scenario: Component is importable
- **WHEN** a developer adds a new table cell that needs to display potentially long text
- **THEN** they can import the shared component from `@/components/<TruncatedCell-or-equivalent>`
- **AND** wrap their cell content in a single element without writing the Tooltip JSX manually

#### Scenario: Component degrades gracefully without provider
- **WHEN** the component is rendered in a tree that lacks `TooltipProvider`
- **THEN** the truncated text still renders correctly
- **AND** no runtime error is thrown

### Requirement: Visual verification convention is documented

`CLAUDE.md` SHALL document the rule that every visual change must be visually confirmed via Playwright headless screenshots, that screenshot output directories must be gitignored, and that Claude must ask the user to verify when it cannot confirm visually.

#### Scenario: CLAUDE.md contains the rule
- **WHEN** a developer (or future AI agent) reads `CLAUDE.md`
- **THEN** they find a section describing the headless-Playwright + screenshot test approach, the gitignore requirement for screenshot output, and the "ask the user when you cannot confirm" fallback

