You are working on my React app and I want you to extend the current project structure and implement the missing features cleanly.

Current state:

* The app currently only has a dashboard overview about projects.
* I want to turn it into a more complete admin-style app.

Requirements:

1. Authentication and roles

* Add role support for users.
* Use `erykede@gmail.com` as the default admin user.
* The admin user should have role `admin`.
* Prepare the app structure so roles can be used for route protection and permissions.

2. Main app structure

* Keep the dashboard overview.
* Complete the rest of the app so it feels like a functional management system.
* Add a clean layout with navigation/sidebar if needed.

3. Routes to add

* `/dashboard` → dashboard overview
* `/projects` → project management page
* `/users` → user management page
* `/tasks` → task management page

4. Projects module

* Create a Projects page where I can:

  * list projects
  * add a project
  * edit a project
  * delete a project
* Include form validation, loading state, and error handling.

5. Users module

* Create a Users page where I can:

  * list users
  * add a user
  * edit a user
  * delete a user
  * assign a role
* Include a default admin user with email `erykede@gmail.com`.
* Include form validation, loading state, and error handling.

6. Tasks module

* Create a Tasks page where I can:

  * list tasks
  * add a task
  * edit a task
  * delete a task
  * assign tasks to a project and optionally to a user
  * track status such as `todo`, `in_progress`, and `done`
* Include form validation, loading state, and error handling.

7. Form handling

* Use a proper form solution for validation, loading, and errors.
* Prefer:

  * React Hook Form
  * Zod for validation
* Show field-level validation errors.
* Show submit loading state.
* Show server/global error messages where appropriate.

8. Error handling

* Add consistent error handling across the app.
* Handle:

  * failed API calls
  * invalid form inputs
  * empty states
  * not found routes
* Add reusable UI for loading, empty, and error states if possible.

9. Loading states

* Add proper loading states for:

  * page data fetching
  * form submissions
  * CRUD actions
* Disable submit buttons while submitting.

10. Architecture

* Organize the code in a scalable way.
* Use clean folder structure for:

  * pages
  * components
  * routes
  * services/api
  * types
  * validation schemas
* If the app currently uses mock data, keep it consistent and extend it.
* If needed, create a fake service layer for now.

11. Routing and protection

* Add routing for all pages.
* Add basic protected route support.
* Prepare role-based access so admin-only sections can be restricted.

12. Deliverables

* Implement the code directly.
* Update existing files where needed.
* Create any missing components, routes, services, and types.
* Keep the UI clean and consistent.
* After implementation, summarize:

  * what was added
  * what files were created/updated
  * any assumptions made

Please make the implementation production-style, readable, typed, and maintainable.
