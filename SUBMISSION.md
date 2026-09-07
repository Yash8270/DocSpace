# DocSpace — Submission Details

**Project**: DocSpace (Collaborative Document Editor)  
**Assignment**: Ajaia Full Stack Product Engineer Assignment  

---

## Deliverables Checklist

- [x] **Source Code**: Fully modular full-stack application (`frontend/` + `backend/`).
- [x] **README.md**: Comprehensive setup, local run commands, API docs, and tech stack details.
- [x] **ARCHITECTURE.md**: Full architecture breakdown, database schema, security model, and trade-offs.
- [x] **AI_WORKFLOW.md**: Honest AI tool usage, speedups, modifications, and rejected features.
- [x] **SUBMISSION.md**: Formal submission document with feature matrix and test status.
- [x] **WALKTHROUGH_LINK.txt**: Text file containing walkthrough video link placeholder.

---

## Live Product & Deployment Information

- **Live Frontend URL**: `https://yash-limbachiya-docspace.vercel.app/` (Local: `http://localhost:3000`)
- **Live Backend API URL**: `https://docspace-5ivu.onrender.com` (Local: `http://localhost:5000`)

---

## Seeded Test Accounts for Reviewers

Use the top-right **User Switcher** dropdown (`👤 User ▾`) to instantly toggle user context:

1. **Alice** (`alice@example.com`): Owner of *Product Roadmap Q4* and *Weekly Sync*.
2. **Bob** (`bob@example.com`): Shared `EDIT` collaborator on Alice's roadmap document.
3. **Charlie** (`charlie@example.com`): Shared `VIEW` read-only user on Alice's roadmap document.

---

## Core Feature Matrix

| Requirement | Status | Notes |
|---|:---:|---|
| Document Creation & Editing | ✅ Complete | TipTap editor with Bold, Italic, Underline, H1, H2, Bullet/Numbered Lists |
| Title Renaming | ✅ Complete | Editable header title input with server persistence |
| Persistence & Refresh | ✅ Complete | Stored as TipTap JSON trees in SQLite via Prisma ORM |
| Debounced Autosave | ✅ Complete | 800ms debounce with `✓ Saved` / `Saving...` / `Unsaved` visual badges |
| File Import (.txt / .md) | ✅ Complete | Upload `.txt` or `.md` files to generate formatted editable documents |
| Multi-user Sharing | ✅ Complete | Share modal supporting `Can Edit` and `Can View` permissions |
| Access Revocation | ✅ Complete | Document owner can revoke access from any shared collaborator |
| Server Authorization | ✅ Complete | Middleware `permission.js` enforcing rules on REST endpoints (403 Forbidden) |
| WebSockets Collaboration | ✅ Complete | Real-time presence indicators, live edit updates & deletion notifications |
| Export to PDF / Markdown | ✅ Complete | Export documents directly as `.md` files or vector PDF print views |
| Automated Tests | ✅ Complete | Vitest suite verifying permissions (`npm test`) |

---

## Known Limitations

1. **Mock Authentication**: Auth is simulated using the `X-User-Id` header for fast reviewer testing without password flows.
2. **DOCX Parsing**: DOCX upload was intentionally skipped to focus on reliable `.txt` and `.md` Markdown parsing.

---

## Next Steps (With 2–4 Additional Hours)

1. **Document Version History**: Auto-save version snapshots with rollback/restore capabilities.
2. **Inline Text Selection Comments**: Highlight specific inline text ranges to attach targeted side comments.
3. **Role-Based Group Access Control**: Group-based access rules (e.g. engineering team, product team).
