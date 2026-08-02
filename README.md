<<<<<<< HEAD
# Enterprise Project Management Platform

A Kanban-based project management tool: role-based access (Admin / Manager /
Employee), drag-and-drop boards, sprints & milestones, comments, file
uploads, notifications, and an analytics dashboard.

**Stack:** Next.js 14 (App Router) · TypeScript · PostgreSQL · Prisma ·
Better Auth · Tailwind CSS · Cloudinary · dnd-kit · Recharts

## What's included

- **Auth** — Better Auth (email/password) with a `role` field on the user
  model (`EMPLOYEE` / `MANAGER` / `ADMIN`). Middleware protects all app
  routes; server-side `requireSession()` / `requireManager()` /
  `requireAdmin()` helpers (`src/lib/session.ts`) enforce role gates on
  pages, and `src/lib/permissions.ts` centralizes the same rules for API
  routes.
- **Data model** (`prisma/schema.prisma`) — Users, Projects, Project
  members, Boards, Columns, Tasks, Sprints, Milestones, Comments,
  Attachments, Notifications, Labels, and an Activity log.
- **Kanban board** — `src/components/kanban/` — drag-and-drop across
  columns and within a column, built on `@dnd-kit`, with optimistic UI and
  a server PATCH to persist the move.
- **Task detail modal** — create/edit, priority, assignee, due date,
  comments thread, file attachment upload to Cloudinary.
- **Analytics dashboard** — `/analytics` (Manager/Admin only) — tasks by
  column, by priority, and sprint status, via Recharts.
- **Team page** — `/team` (Admin only) — change a user's role.
- **Notifications** — created on task assignment and on comments to a
  task's assignee; `/notifications` page with mark-as-read.

## Getting started

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL, BETTER_AUTH_SECRET, Cloudinary keys
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed        # optional: seeds a demo project/board (see note below)
npm run dev
```

Open http://localhost:3000 — you'll land on `/login`. Register a new
account (it becomes `EMPLOYEE` by default); promote yourself to `ADMIN`
directly in the database or via Prisma Studio (`npm run prisma:studio`)
to unlock `/team` and role management.

### Environment variables

See `.env.example`. At minimum you need:
- `DATABASE_URL` — a PostgreSQL connection string
- `BETTER_AUTH_SECRET` — any long random string (`openssl rand -base64 32`)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
  — from your Cloudinary dashboard (needed for file uploads)

### About the seed script

`prisma/seed.ts` creates demo users directly in the database, bypassing
Better Auth's password hashing — so those seeded accounts won't have a
usable password out of the box. It's there to give you a project, board,
columns, and a couple of tasks to look at immediately. For accounts you can
actually log in with, use `/register`, then adjust roles via
`npm run prisma:studio`.

## Project structure

```
prisma/schema.prisma        Data model
src/
  app/
    (app)/                  Authenticated routes, shared sidebar+navbar layout
      dashboard/            "My projects" + "assigned to me"
      projects/[id]/        Kanban board for one project
      analytics/            Manager/Admin charts
      team/                 Admin role management
      notifications/
    api/                    Route handlers (tasks, projects, comments, upload, notifications, roles)
    login/ register/        Auth pages
  components/
    kanban/                 Board, Column, TaskCard, TaskModal, CommentThread
    layout/                 Sidebar, Navbar
    analytics/              Recharts wrappers
    ui/                     Button, Input
  lib/
    auth.ts / auth-client.ts   Better Auth server + client
    permissions.ts             Role-based access rules
    cloudinary.ts               Upload/delete helpers
    session.ts                  Server-side session/role guards
  middleware.ts              Route protection (must be logged in)
```

## What to build next

This scaffold covers the full feature list end-to-end but at MVP depth.
Natural next steps, roughly in order of value:
1. **Sprint & milestone UI** — the schema and relations exist (`Sprint`,
   `Milestone`, and `Task.sprintId` / `Task.milestoneId`); there's no
   dedicated sprint board or burndown view yet.
2. **Column management** — add/reorder/delete columns from the board UI
   (columns currently come from the default set created with each project).
3. **Real-time updates** — task moves and comments currently rely on a
   page refresh for other users to see changes; consider polling, SSE, or
   a WebSocket layer.
4. **Email notifications** — the `Notification` model and in-app list exist;
   there's no email delivery on top of it yet.
5. **Tests** — none included; the API routes are a natural place to start
   with integration tests against a test database.
=======
# epm-platform
>>>>>>> 7beef08e7eeed27ed79bdfa77766f7e2a68412a9
