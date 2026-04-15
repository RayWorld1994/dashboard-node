Act as a senior full-stack engineer.

Build Stage 1 of a complex dashboard system with:
- React 19 (frontend)
- Node.js (backend)
- PostgreSQL (database)

Authentication already exists, so do NOT implement login/register.

Goal:
Create a scalable dashboard foundation with a professional UI, Redux state management, dark/light theme, and a backend API connected to PostgreSQL with seeded fake data.

-----------------------------------
FRONTEND REQUIREMENTS
-----------------------------------
- React 19 + TypeScript
- Tailwind CSS
- Redux Toolkit (for UI, user, dashboard state)
- React Router
- Dark/Light mode (persisted in localStorage)

Features:
1. Dashboard layout
   - Sidebar (collapsible)
   - Top navbar
   - Main content area

2. Dashboard page
   - Summary cards (projects, tasks, users)
   - Recent activity section
   - Quick stats section
   - Use API data (not hardcoded)

3. UI State (Redux)
   - Sidebar open/close
   - Theme (dark/light)
   - Notifications (basic mock)

4. User State (Redux)
   - Mock authenticated user

-----------------------------------
BACKEND REQUIREMENTS
-----------------------------------
- Node.js with Express
- PostgreSQL
- Use a clean architecture (routes, controllers, services, db)

Create APIs:
- GET /api/dashboard/summary
- GET /api/projects
- GET /api/tasks
- GET /api/users
- GET /api/activity

-----------------------------------
DATABASE DESIGN (PostgreSQL)
-----------------------------------
Create tables:

users:
- id
- name
- email
- role
- avatar_url
- created_at

projects:
- id
- name
- status (active, completed, pending)
- owner_id
- created_at

tasks:
- id
- title
- status (todo, in_progress, done)
- priority (low, medium, high)
- project_id
- assigned_to
- due_date
- created_at

activity_logs:
- id
- user_id
- action
- entity_type
- entity_id
- created_at

-----------------------------------
SEED DATA (IMPORTANT)
-----------------------------------
Generate realistic fake data:

- 10–15 users
- 5–10 projects
- 50+ tasks
- 30+ activity logs

Use realistic names, emails, and relationships:
- Tasks must belong to projects
- Tasks must be assigned to users
- Activity logs must reference real users and entities

Provide:
1. SQL seed file OR
2. Node.js seed script using faker library

-----------------------------------
DASHBOARD API LOGIC
-----------------------------------
/api/dashboard/summary should return:
- total projects
- active tasks
- completed tasks
- total users

/api/activity should return recent activity sorted by date

-----------------------------------
ARCHITECTURE
-----------------------------------
Backend:
- /src
  - routes
  - controllers
  - services
  - db
  - seed

Frontend:
- /app
- /components
- /layout
- /pages
- /store
- /features

-----------------------------------
WHAT TO OUTPUT
-----------------------------------
1. npm install commands (frontend + backend)
2. PostgreSQL schema (CREATE TABLE)
3. Seed script (with fake data)
4. Backend structure + API implementation
5. Frontend Redux setup
6. Theme (dark/light) implementation
7. Layout (sidebar + navbar)
8. Dashboard page consuming API
9. Instructions to run everything

-----------------------------------
IMPORTANT
-----------------------------------
- Use clean, production-style code
- Use best practices
- Keep everything modular and scalable
- Do not overcomplicate but make it realistic
- Make the UI feel like a real SaaS dashboard