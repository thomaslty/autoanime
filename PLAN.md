# Development Plan

## 1. Fix Sidebar State Persistence
**Problem:** When RSS Management is expanded, clicking any sidebar item collapses it. The `openMenus` state in `AppSidebar.jsx:56` is not persisted across navigation.

**Solution:**
- Add `useEffect` to sync `openMenus` with current pathname
- Auto-expand parent menu when child route is active
- Optionally persist to localStorage for user preference

**Files:** `frontend/src/components/AppSidebar.jsx`

## 2. RSS Feed Page - Fetch Button Animation
**Problem:** Clicking the fetch button provides no visual feedback during the async operation.

**Solution:**
- Add `fetchingId` state to track which feed is being fetched
- Apply `animate-spin` class to RefreshCw icon when active
- Disable button during fetch to prevent double-clicks

**Files:** `frontend/src/pages/RSSSourcesPage.jsx:151-159`

## 3. RSS Feed Page - Sorting & Pagination
**Problem:** No sorting or pagination on RSS feeds table; all feeds displayed at once.

**Solution (match RSSItemsPage pattern):**
- Add state: `sortField`, `sortDir`, `page`, `pageSize` 
- Implement `handleSort()` function with toggle logic
- Add `SortIcon` component for visual indicators
- Use `useMemo` for client-side sorting
- Add pagination controls (First, Prev, Next, Last)
- Page size selector: 50, 100, 200, 500

**Files:** `frontend/src/pages/RSSSourcesPage.jsx`
**Reference:** `frontend/src/pages/RSSItemsPage.jsx:21-128`

## 4. RSS Config Page - Sorting & Pagination  
**Problem:** No sorting or pagination on RSS configs table.

**Solution (same as #3):**
- Copy sorting/pagination implementation from RSSItemsPage
- Sortable columns: ID, Name, Regex, Source, Status

**Files:** `frontend/src/pages/RSSAnimeConfigsPage.jsx`

## 5. Backend Logging with Pino
**Problem:** Backend uses unstructured `console.log`/`console.error` with manual prefixes.

**Solution:**
- Install `pino` and `pino-pretty` packages
- Create logger instance in new file: `backend/src/utils/logger.js`
- Replace console statements in:
  - `backend/src/services/rssService.js`
  - `backend/src/services/rssSchedulerService.js`
  - `backend/src/controllers/rssController.js`
  - `backend/src/controllers/rssConfigController.js`
- Use structured logging with context (service name, operation, metadata)

**Example:**
```javascript
// Before
console.log(`[RSS Scheduler] Fetching ${feeds.length} feed(s)...`)

// After  
logger.info({ feedCount: feeds.length }, 'Fetching RSS feeds')
```

**Files:** 
- `backend/package.json` (add dependencies)
- `backend/src/utils/logger.js` (new file)
- `backend/src/services/*.js`
- `backend/src/controllers/*.js`

---

## Implementation Notes

### Priority Order
1. Sidebar fix (UX bug) → 2. Fetch animation (UX polish) → 3-4. Tables (feature parity) → 5. Logging (backend improvement)

### Tech Stack Reminders
- Use shadcn/ui components only
- Tailwind CSS for styling
- Lucide React for icons
- Follow existing patterns in RSSItemsPage for table features
- Pino for structured logging

### Testing Checklist
- [ ] Sidebar stays expanded when navigating between RSS sub-pages
- [ ] Fetch button shows spinning animation during operation
- [ ] All table columns sortable (toggle asc/desc)
- [ ] Pagination works with different page sizes
- [ ] Backend logs output structured JSON (or pretty in dev)
