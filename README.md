# DocSpace — Collaborative Document Editor

DocSpace is a lightweight, full-stack collaborative document editor inspired by Google Docs, built for the Ajaia Product Engineer Assignment. It features rich-text document editing, debounced autosave, document title renaming, file import (`.txt` and `.md`), granular multi-user document sharing with permissions (`Owner`, `Can Edit`, `Can View`), **Socket.io WebSockets real-time collaboration & presence indicators**, and persistent SQLite storage.

---

## Live Demo & Working Deployment

- **Frontend Application**: Deployed on Vercel / Render / Preferred Host (Local: `http://localhost:3000`)
- **Backend REST & WebSockets API**: Express + Socket.io Server (Local: `http://localhost:5000`)

---

## Key Features

1. **Document Creation & Rich-Text Editing**:
   - Create, open, rename, save, and delete documents.
   - TipTap Editor supporting Bold, Italic, Underline, Headings (H1, H2), Bullet Lists, Numbered Lists, Undo, and Redo.
   - Formatting and document structure survive page refreshes and browser restarts.

2. **Socket.io WebSockets Real-Time Collaboration**:
   - **Live Presence Indicator**: Header presence pill displaying active online collaborators (`🟢 Collaborators Online: Alice, Bob`).
   - **Live Document Sync**: When User A (Alice) edits or renames a document, User B (Bob) receives real-time updates and notifications (`⚡ Alice editing...`) in their browser window!

3. **Export to PDF & Markdown**:
   - **Export as Markdown (.md)**: Converts TipTap document AST into clean Markdown files for download.
   - **Export as PDF (.pdf)**: Styled vector PDF print view with header metadata and clean document layout.

4. **Debounced Autosave & Save Status**:
   - 800ms debounced autosave sending PATCH updates to backend API.
   - Real-time visual feedback: `✓ Saved`, `Saving...`, `Unsaved changes`, `Read-Only Mode`, and error indicators.

5. **File Import Engine**:
   - Upload `.txt` and `.md` files to automatically generate formatted editable documents.
   - Clear UI feedback displaying supported formats (`.txt`, `.md`).

6. **Multi-User Sharing & Access Control**:
   - Granular permission system: Document Owner, Editor (`Can Edit`), Viewer (`Can View`).
   - Share modal allowing owners to add users with specific permissions or revoke access.
   - Clear visual badges distinguishing owned vs shared documents across the dashboard and editor.

8. **Server-Side Authorization**:
   - Mandatory authorization middleware (`permission.js`) validating every REST request on the server.
   - Non-shared users are denied access with `403 Forbidden`.
   - Read-only viewers are prevented from saving edits server-side.

---

## Tech Stack

- **Frontend**: React (v18), Vite, JavaScript, Tailwind CSS, TipTap, Lucide React, Axios, React Router v6, Socket.io Client.
- **Backend**: Node.js, Express.js, Prisma ORM, SQLite, Multer, Socket.io Server.
- **Testing**: Vitest + Supertest for permission & authorization testing.

---

## Demo Seeded Users

To test multi-user sharing without authenticating via external OAuth, use the header **User Switcher**:

- **Alice**: `alice@example.com` (Owner of *Product Roadmap Q4* & *Weekly Sync*)
- **Bob**: `bob@example.com` (Collaborator with `EDIT` access to Alice's roadmap)
- **Charlie**: `charlie@example.com` (Viewer with `VIEW` read-only access)

---

## Local Setup & Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Backend Setup

```bash
cd backend
npm install

# Run database migrations & seed initial data
npx prisma db push
npm run seed

# Start Express server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start Vite development server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your browser. Open a second browser tab or incognito window to test **Socket.io WebSockets real-time collaboration** between Alice and Bob!

---

## API & WebSockets Overview

### WebSockets Events (Socket.io)
- `join-document` — Client joins live document room.
- `presence-update` — Server broadcasts list of active online collaborators.
- `document-content-changed` — Client emits live content/title update.
- `remote-document-changed` — Server broadcasts live update to room collaborators.

### Users
- `GET /api/users` — List seeded users for User Switcher & Sharing options.

### Documents
- `GET /api/documents` — Fetch owned & shared documents for active user.
- `POST /api/documents` — Create a new blank document.
- `GET /api/documents/:id` — Fetch document details (Requires `READ` permission).
- `PATCH /api/documents/:id` — Update title/content (Requires `EDIT` permission).
- `DELETE /api/documents/:id` — Delete document (Requires `OWNER` permission).

### Sharing
- `GET /api/documents/:id/shares` — Get access list for document (Owner only).
- `POST /api/documents/:id/shares` — Grant `EDIT` or `VIEW` access (Owner only).
- `DELETE /api/documents/:id/shares/:userId` — Revoke access for a user (Owner only).

### Import
- `POST /api/import` — Upload `.txt` or `.md` file to parse and generate a document.

---

## Testing

Run automated permission & authorization tests:

```bash
cd backend
npm test
```
