# DocSpace Architecture Note

This document outlines the technical architecture, design decisions, database schema, security/authorization model, and intentional trade-offs for **DocSpace**.

---

## 1. System Architecture Overview

```text
React + Vite Frontend (JavaScript + Tailwind CSS + TipTap)
                    │
                    │ REST API Calls (Axios with X-User-Id Header)
                    ▼
Node.js + Express API Server
                    │
   ┌────────────────┼────────────────┐
   ▼                ▼                ▼
Mock Auth     Permission Check   File Import Parser
Middleware      Middleware       (.txt / .md to Tiptap JSON)
   │                │                │
   └────────────────┼────────────────┘
                    ▼
           Prisma ORM Layer
                    │
                    ▼
             SQLite Database
      (dev.db - Persistent Storage)
```

---

## 2. Technology Selection Rationale

### Frontend: React + Vite + Tailwind CSS + TipTap
- **React + Vite**: Chosen over Next.js / CRA for ultra-fast HMR build speeds, low bundle size, and clean separation between client UI and backend API.
- **TipTap Editor**: Industry standard headless rich-text editor based on ProseMirror. Stores document content as structured JSON trees rather than raw HTML strings, guaranteeing lossless formatting preservation across save/restore cycles.
- **Tailwind CSS + Lucide Icons**: Enables building a modern, accessible, responsive Google Docs-style user interface with subtle hover states, modals, and clear visual hierarchy.

### Backend: Node.js + Express + Prisma + SQLite
- **Node.js + Express**: Provides a lightweight, flexible REST API framework for handling document operations, file parsing, and authorization middleware.
- **Prisma ORM + SQLite**: SQLite provides zero-config, portable persistence that retains data across server restarts. Prisma delivers typed schema definitions, cascade deletes, unique compound indices, and clean database migrations.

---

## 3. Database Schema Design

```prisma
model User {
  id        String          @id @default(uuid())
  name      String
  email     String          @unique
  createdAt DateTime        @default(now())
  ownedDocs Document[]      @relation("DocOwner")
  shares    DocumentShare[]
}

model Document {
  id        String          @id @default(uuid())
  title     String          @default("Untitled Document")
  content   String          // JSON String representation of Tiptap document tree
  ownerId   String
  owner     User            @relation("DocOwner", fields: [ownerId], references: [id])
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  shares    DocumentShare[]
}

model DocumentShare {
  id         String   @id @default(uuid())
  documentId String
  userId     String
  permission String   // "EDIT" or "VIEW"
  createdAt  DateTime @default(now())
  document   Document @relation(fields: [documentId], references: [id])
  user       User     @relation(fields: [userId], references: [id])

  @@unique([documentId, userId])
}
```

---

## 4. Server-Side Authorization & Security Model

DocSpace enforces security at the Express API layer using custom middleware (`permission.js`) and service logic (`permissionService.js`). Client-side button hiding is purely for user experience; every request is authorized on the backend.

### Permission Hierarchy Matrix

| Action | Owner | Shared (`EDIT`) | Shared (`VIEW`) | Unshared User |
|---|:---:|:---:|:---:|:---:|
| Read Document | ✅ | ✅ | ✅ | ❌ (403 Forbidden) |
| Edit Content / Rename | ✅ | ✅ | ❌ (403 Forbidden) | ❌ (403 Forbidden) |
| Delete Document | ✅ | ❌ (403 Forbidden) | ❌ (403 Forbidden) | ❌ (403 Forbidden) |
| Manage Shares | ✅ | ❌ (403 Forbidden) | ❌ (403 Forbidden) | ❌ (403 Forbidden) |

---

## 5. Debounced Autosave Lifecycle

```text
User edits text in TipTap
           ↓
onUpdate event triggers in DocumentEditor
           ↓
SaveStatus set to 'Unsaved changes'
           ↓
800ms Debounce Timer starts (resets on subsequent keystrokes)
           ↓
PATCH request sent to /api/documents/:id
           ↓
SaveStatus set to 'Saving...'
           ↓
200 OK Response received → SaveStatus set to '✓ Saved'
```

---

## 6. Trade-offs & Intentionally Deprioritized Features

1. **Mock Auth over OAuth**: To maximize reviewer evaluation efficiency, real passwords/JWTs were replaced with an instant top-bar User Switcher (Alice, Bob, Charlie).
2. **REST API over WebSockets/CRDTs**: Real-time multi-cursor collaboration was intentionally skipped in favor of building a bulletproof REST architecture with debounced autosave and granular server-side authorization.
3. **.txt & .md Import over DOCX**: Focused on robust Markdown and plain-text parsing into Tiptap JSON schema.
