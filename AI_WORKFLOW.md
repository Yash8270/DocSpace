# AI-Native Workflow Note

This note documents how AI tooling was utilized throughout the design, implementation, testing, and documentation of **DocSpace**.

---

## 1. AI Tools Used

- **Google Antigravity AI Assistant**: Leveraged for pair-programming, full-stack architecture design, rapid scaffolding, test generation, and documentation drafting.

---

## 2. Where AI Materially Accelerated Work

1. **Full-Stack Scaffolding**: AI accelerated generating clean boilerplate for Express routes, controllers, middleware, and Prisma SQLite schemas.
2. **TipTap Editor Integration**: AI assisted in building the custom `EditorToolbar` component and mapping ProseMirror formatting commands to Lucide React buttons.
3. **File Import Parser**: AI generated the regex parsing rules in `importService.js` for converting `# Headings`, `**bold**`, `*italic*`, and `- bullet lists` from raw Markdown into TipTap JSON nodes.
4. **Vitest Permission Tests**: AI generated unit tests covering authorization edge cases (`Owner edit`, `Editor edit`, `Viewer forbidden edit`, `Unshared access denied`).

---

## 3. Code Modifications & Refinements

- **TipTap Autosave Debouncing**: Initial AI-generated editor code attempted to autosave on every single keystroke. Refactored `DocumentEditor.jsx` to introduce an `800ms` debounce timer with `SaveStatus` state tracking to prevent spamming backend PATCH endpoints.
- **Prisma Schema Constraints**: Refined schema relations to add `@unique([documentId, userId])` compound index on `DocumentShare` to prevent duplicate share records for the same user.
- **Permission Authorization Layer**: Ensured all permission checks (`isOwner`, `EDIT`, `VIEW`) were executed in server-side middleware (`permission.js`) rather than relying on client UI states.

---

## 4. Features Intentionally Rejected

To ensure delivery within the tight timebox and maintain high engineering quality, the following AI-suggested features were explicitly rejected:
- **WebSockets / CRDT Real-time Collaboration**: Deferred to maintain focus on single-user editing and robust REST server authorization.
- **Complex OAuth / Auth0 / JWTs**: Replaced with a lightweight, seeded Mock User Switcher (`X-User-Id` header) to streamline reviewer evaluation.
- **DOCX Parsing with Mammoth**: Deprioritized to ensure `.txt` and `.md` file import was tested and fully reliable.

---

## 5. Verification & Quality Assurance

All AI-generated code was validated through:
1. **Automated Unit & Integration Testing**: Vitest test suite (`npm test`) executing permission checks against a live SQLite database instance.
2. **Manual End-to-End User Flow Verification**: Testing user switching between Alice (Owner), Bob (Editor), and Charlie (Viewer) to verify read-only states, title renaming, autosave, and access revocation.
