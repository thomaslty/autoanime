## ADDED Requirements

### Requirement: Column drag handle

Each resize-enabled `<TableHead>` SHALL render an interactive handle on its right edge that the user can grab to change the column's width.

#### Scenario: Handle is reachable on hover
- **WHEN** the user hovers a resize-enabled column header
- **THEN** a thin vertical handle becomes visible on the column's right edge
- **AND** the cursor changes to `col-resize` over the handle

#### Scenario: Drag widens column
- **WHEN** the user presses the handle and drags right by N pixels
- **THEN** the column's width increases by N pixels (clamped to a sensible maximum imposed by the table container)
- **AND** the column's cells reflow with the new width

#### Scenario: Drag narrows column
- **WHEN** the user drags the handle left
- **THEN** the column's width decreases
- **AND** the width never goes below the configured minimum width
- **AND** cells whose content no longer fits begin to truncate (per the existing truncation tooltip behavior)

#### Scenario: Handle does not trigger sort
- **WHEN** the user clicks/presses the resize handle of a sortable column
- **THEN** the column does NOT toggle its sort state
- **AND** only the resize interaction is initiated

### Requirement: Width persistence per browser

Column widths SHALL persist across page reloads in the user's browser via `localStorage`, keyed by table identifier and column key.

#### Scenario: Widths survive reload
- **WHEN** the user resizes a column to W pixels and then reloads the page
- **THEN** the column re-renders at width W on the next load

#### Scenario: Default width applied when no stored value
- **WHEN** a column key has no stored width in localStorage
- **THEN** the column renders at its declared default width

#### Scenario: Reset to default
- **WHEN** the user double-clicks a column's resize handle
- **THEN** that column's width returns to its default
- **AND** the stored width entry for that column is removed from localStorage

### Requirement: No regression of existing tables

Tables that have NOT opted into resize behavior SHALL render and behave identically to their pre-change state.

#### Scenario: Non-resizable table unchanged
- **WHEN** the user views a table that has not been migrated to `useResizableColumns`
- **THEN** column widths, layout, and sorting behave exactly as before
- **AND** no resize handle is shown

### Requirement: Coexistence with truncation tooltips

Resizing a column SHALL not break the truncation-tooltip behavior introduced in `table-truncation-tooltip`.

#### Scenario: Narrow then hover
- **WHEN** the user narrows a column until cell text begins to clip
- **AND** hovers a clipped cell
- **THEN** the full text appears in a tooltip

#### Scenario: Widen until full text shown
- **WHEN** the user widens a column until cell text no longer clips
- **THEN** the cell renders the complete text without truncation
- **AND** the tooltip still appears on hover (always-on per Phase A decision)

## MODIFIED Requirements

<!-- None yet — `table-truncation-tooltip` capability does not need its requirements rewritten; the new "Coexistence with truncation tooltips" requirement above lives in this capability and references the other one by name. -->
