# RSS System Feature Plan

Feature enhancements for the RSS Sources page (`RSSSourcesPage.jsx`).

---

## 1. Group Action Buttons into Dropdown Menu

**Current State:** Action buttons (Fetch, Toggle, Edit, Delete) are displayed inline for each row.

**Goal:** Replace Edit, Delete, and Toggle buttons with a "Manage" dropdown, keeping Fetch as a standalone hot button.

### Frontend Changes

#### [MODIFY] [RSSSourcesPage.jsx](file:///home/coder/project/autoanime/frontend/src/pages/RSSSourcesPage.jsx)

- Import `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` from Shadcn UI
- Replace inline action buttons with:
  - **"Fetch" button** — remains as standalone button (hot action)
  - **"View" button** — navigates to RSS items detail page for this source
  - **"Manage" dropdown** containing:
    - Enable / Disable (toggle action)
    - Edit (opens edit dialog)
    - Clear RSS Items (new action)
    - Delete (with confirmation)

### Backend Changes

#### [NEW] `DELETE /api/rss/:id/items` endpoint

Add new route and controller to clear all RSS items for a specific feed.

| File | Change |
|------|--------|
| `backend/src/routes/rss.js` | Add `router.delete('/:id/items', rssController.clearRssItems)` |
| `backend/src/controllers/rssController.js` | Add `clearRssItems` function |
| `backend/src/services/rssService.js` | Add `clearRssItems(id)` method |

---

## 2. Dismissible Warning Alerts

**Current State:** Service warnings (Sonarr/qBittorrent not configured) display but cannot be closed.

**Goal:** Add a close button to dismiss these warnings (session-only, not persisted).

### Frontend Changes

#### [MODIFY] [RSSSourcesPage.jsx](file:///home/coder/project/autoanime/frontend/src/pages/RSSSourcesPage.jsx)

- Add `dismissedWarnings` state (e.g., `useState(new Set())`)
- Import `X` icon from lucide-react
- Add close button to Alert component
- On click, add warning key to `dismissedWarnings` set
- Conditionally render alert based on whether it's been dismissed

---

## 3. Improved Backend Connection Error Messages

**Current State:** Shows generic `Error: Failed to fetch feeds` when backend is unreachable.

**Goal:** Display a more user-friendly error message and suggest troubleshooting steps.

### Frontend Changes

#### [MODIFY] [RSSSourcesPage.jsx](file:///home/coder/project/autoanime/frontend/src/pages/RSSSourcesPage.jsx)

- Update `fetchFeeds` catch block to detect network errors (`TypeError: Failed to fetch`)
- Display specific error:
  - **Network error:** "Unable to connect to backend server. Please check if the backend is running on port 3000."
  - **Other errors:** Display the actual error message from response

---

## 4. RSS Item Detail View Page

**Current State:** Endpoint `GET /api/rss/:id/items` exists but no dedicated UI page.

**Goal:** Create a new page to view and manage RSS items for a specific source.

### Frontend Changes

#### [NEW] [RSSItemsPage.jsx](file:///home/coder/project/autoanime/frontend/src/pages/RSSItemsPage.jsx)

- Route: `/rss/:id/items`
- Features:
  - Display list of RSS items with title, link, published date, etc.
  - Search/filter functionality
  - Action: Edit RSS item
  - Action: Manually add RSS item to qBittorrent

#### [MODIFY] [App.jsx](file:///home/coder/project/autoanime/frontend/src/App.jsx)

- Add route for `/rss/:id/items` → `RSSItemsPage`

### Backend Changes

#### [MODIFY] `PUT /api/rss/:id/items/:itemId`

Add endpoint to update an individual RSS item.

| File | Change |
|------|--------|
| `backend/src/routes/rss.js` | Add `router.put('/:id/items/:itemId', rssController.updateRssItem)` |
| `backend/src/controllers/rssController.js` | Add `updateRssItem` function |
| `backend/src/services/rssService.js` | Add `updateRssItem(feedId, itemId, data)` method |

#### [NEW] `POST /api/rss/:id/items/:itemId/download`

Add endpoint to send RSS item to qBittorrent.

| File | Change |
|------|--------|
| `backend/src/routes/rss.js` | Add `router.post('/:id/items/:itemId/download', rssController.downloadRssItem)` |
| `backend/src/controllers/rssController.js` | Add `downloadRssItem` function |
| `backend/src/services/rssService.js` | Add `downloadRssItem(feedId, itemId)` method using qBittorrent service |

---

## Summary of Changes

| Area | Files Affected |
|------|----------------|
| Frontend | `RSSSourcesPage.jsx`, `App.jsx`, `RSSItemsPage.jsx` (new) |
| Backend Routes | `rss.js` |
| Backend Controllers | `rssController.js` |
| Backend Services | `rssService.js` |

---

## Verification Plan

### Manual Testing

1. **Group Action Dropdown:**
   - Navigate to RSS Sources page
   - Verify Fetch and View buttons are standalone
   - Click "Manage" dropdown and verify all options appear
   - Test each option: Enable/Disable, Edit, Clear Items, Delete

2. **Dismissible Warnings:**
   - Trigger a warning (e.g., disconnect qBittorrent)
   - Verify warning displays
   - Click close button, verify warning is dismissed
   - Refresh page, verify warning reappears (session-only)

3. **Improved Error Messages:**
   - Stop backend server
   - Navigate to RSS Sources page
   - Verify user-friendly error message appears

4. **RSS Items Page:**
   - Click "View" on an RSS source
   - Verify items list displays
   - Test edit functionality
   - Test download to qBittorrent functionality