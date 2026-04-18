# Sprint 10: Travel Journal

**SoloAdventurer Web App - Sprint 10**
**Duration**: 2-3 weeks
**Status**: 📋 Planned
**Dependencies**: Sprint 9 (Onboarding — for profile/photo infrastructure)

---

## Sprint Goal

Build a travel journal feature that allows users to create rich text entries with photo uploads, location tagging, mood tracking, and trip organization — replicating the mobile app's journal system.

---

## Why This Sprint Exists

The mobile app has a comprehensive journal feature:
- Rich text editor with formatting
- Photo/video uploads with compression
- Location tagging with geocoding
- Mood tracking per entry
- Search/filter by text, date, location, mood, tags
- PDF export
- Offline support with sync

The web app has no journal functionality. This sprint builds the browser-compatible equivalent, with photo uploads via the browser File API (no camera access needed).

---

## Mobile App Reference

### Journal Data Model
```
JournalEntry:
  id, userId, tripId, title, content (rich text),
  mood (excited | happy | neutral | tired | sad),
  location { name, latitude, longitude },
  media [{ type, url, thumbnailUrl, caption }],
  tags [], isPublished, createdAt, updatedAt
```

### Key Features
- Rich text editor (Flutter Quill on mobile)
- Media picker with compression
- Geocoding for location names
- Advanced search (text + date range + location + mood + tags)
- PDF export
- Cloud storage via Supabase Storage

---

## Epic Breakdown

### Epic 1: Journal Data Layer

Set up the database schema and API layer.

#### Tasks:

- [ ] **Create journal types**
  - [ ] `src/types/journal.ts`
  - [ ] `JournalEntry` — id, userId, tripId, title, content, mood, location, media, tags, isPublished, timestamps
  - [ ] `JournalMedia` — type (photo/video), url, thumbnailUrl, caption
  - [ ] `JournalEntryLocation` — name, latitude, longitude
  - [ ] `Mood` type — excited | happy | neutral | tired | sad
  - [ ] **Test:** Types compile without errors

- [ ] **Verify/create Supabase tables**
  - [ ] Check `journal_entries` table exists (shared with mobile)
  - [ ] Check `journal_media` table exists
  - [ ] Verify RLS policies allow user CRUD on own entries
  - [ ] **Test:** Can insert/query journal entries via Supabase client

- [ ] **Create journal API layer**
  - [ ] `src/lib/api/journal.ts`
  - [ ] `getEntries(userId, filters?)` — list entries with pagination
  - [ ] `getEntry(entryId)` — single entry with media
  - [ ] `createEntry(data)` — insert entry
  - [ ] `updateEntry(entryId, data)` — update entry
  - [ ] `deleteEntry(entryId)` — soft delete
  - [ ] `uploadMedia(file)` — upload to Supabase Storage, return URL
  - [ ] `searchEntries(query, filters?)` — full-text search with filters
  - [ ] **Test:** CRUD operations work end-to-end

---

### Epic 2: Journal Entry Editor

Build the rich text editor for creating and editing entries.

#### Tasks:

- [ ] **Choose and integrate rich text editor**
  - [ ] Evaluate options: TipTap, React Quill, Slate, Lexical
  - [ ] Install and configure chosen editor
  - [ ] Support: bold, italic, headings, lists, links, blockquotes
  - [ ] **Test:** Editor renders and accepts input

- [ ] **Build JournalEntryEditor component**
  - [ ] `src/components/features/journal/JournalEntryEditor.tsx`
  - [ ] Title input
  - [ ] Rich text content area
  - [ ] Mood selector (emoji-based: 😄 😊 😐 😴 😢)
  - [ ] Tag input (comma-separated or chip input)
  - [ ] Location input with autocomplete (Mapbox Places API or browser geolocation)
  - [ ] **Test:** Editor captures all entry fields

- [ ] **Build media upload for entries**
  - [ ] `src/components/features/journal/JournalMediaUpload.tsx`
  - [ ] File input accepting images (browser-based, no camera needed)
  - [ ] Drag-and-drop zone
  - [ ] Preview thumbnails before upload
  - [ ] Upload to Supabase Storage `journal-media` bucket
  - [ ] Insert media references into entry
  - [ ] **Test:** Photos upload and display in entry

- [ ] **Build entry create/edit pages**
  - [ ] `src/app/(main)/journal/new/page.tsx` — create new entry
  - [ ] `src/app/(main)/journal/[id]/edit/page.tsx` — edit existing entry
  - [ ] Save draft auto-saves every 30 seconds
  - [ ] Publish/Save as draft toggle
  - [ ] **Test:** Create and edit flows work

---

### Epic 3: Journal Display & Browsing

Build the journal feed and detail views.

#### Tasks:

- [ ] **Build journal list page**
  - [ ] `src/app/(main)/journal/page.tsx`
  - [ ] Grid/list view toggle of journal entries
  - [ ] Entry cards with: cover photo, title, date, mood emoji, location, excerpt
  - [ ] Filter by: trip, mood, date range, tags
  - [ ] Sort by: newest, oldest, mood
  - [ ] **Test:** Journal list displays entries from Supabase

- [ ] **Build journal detail page**
  - [ ] `src/app/(main)/journal/[id]/page.tsx`
  - [ ] Render rich text content with proper formatting
  - [ ] Photo gallery (click to expand)
  - [ ] Location map (Mapbox integration)
  - [ ] Mood indicator
  - [ ] Tags display
  - [ ] Edit/Delete actions (owner only)
  - [ ] **Test:** Detail page renders full entry

- [ ] **Build journal entry card component**
  - [ ] `src/components/features/journal/JournalEntryCard.tsx`
  - [ ] Cover photo with gradient overlay
  - [ ] Title, date, location
  - [ ] Mood emoji badge
  - [ ] Excerpt text (truncated)
  - [ ] **Test:** Card renders with entry data

---

### Epic 4: Journal Search & Export

Add search functionality and PDF export.

#### Tasks:

- [ ] **Build journal search**
  - [ ] `src/components/features/journal/JournalSearch.tsx`
  - [ ] Full-text search across title and content
  - [ ] Advanced filters: date range, mood, location, tags
  - [ ] Search results with highlighted matches
  - [ ] **Test:** Search returns relevant entries

- [ ] **Build PDF export**
  - [ ] Install a PDF generation library (e.g., `html2pdf.js`, `@react-pdf/renderer`)
  - [ ] Export single entry as formatted PDF with photos
  - [ ] Export all entries from a trip as combined PDF
  - [ ] **Test:** PDF generates with correct formatting

---

## Verification Checklist

1. `npx tsc --noEmit` — zero errors
2. Create entry — title, rich text, mood, location, tags all save
3. Photo upload — images stored in Supabase Storage and display in entry
4. Journal list — entries display with cover photos and metadata
5. Search — full-text search returns matching entries
6. PDF export — generates downloadable PDF with content and photos
7. Edit/delete — owner can modify or remove entries
8. Cross-platform — entries created on mobile visible on web
