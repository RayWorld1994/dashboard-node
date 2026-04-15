Extend my current React + TypeScript admin app with a project task board and task detail workflow.

Current app context:

* The app already has routes for dashboard, projects, users, and tasks.
* Projects, users, and tasks already exist as management modules.
* I now want to improve the Projects area so each project can open its own task board.

What I want to add:

1. Project task board route

* Add a nested route like:

  * `/projects/:projectId`
  * or `/projects/:projectId/board`
* This page should show all tasks related to the selected project.

2. Kanban / board view

* Build a board with columns by task status:

  * `todo`
  * `in_progress`
  * `review`
  * `blocked`
  * `done`
* Each task should appear as a draggable card.
* I want to drag and drop tasks between columns to change status.

3. Drag and drop

* Suggest and implement a good drag-and-drop library for React.
* Prefer a modern and maintained library.
* Make the implementation clean and reusable.
* Update task status immediately in UI and persist it through the existing service/mock API layer.

4. Filtering

* Add filters on the board:

  * filter tasks by assigned user/person
  * optionally filter by priority
  * optionally filter by text search
* The filters should work smoothly and update the board in real time.

5. Task history / activity log

* Save history for each task action.
* Every important action should create a history record, for example:

  * task created
  * status changed
  * priority changed
  * description updated
  * assignee changed
  * comment added
* Each history item should include:

  * task id
  * action type
  * old value if relevant
  * new value if relevant
  * user if available
  * timestamp
* Add a clean UI section to display task history in the task detail view.

6. Task detail route / modal

* Allow opening a task from the board into a detail page or modal.
* Example route:

  * `/tasks/:taskId`
  * or open a modal while staying on the board
* In task detail I want to be able to:

  * edit title
  * edit description
  * change priority
  * change status
  * assign/reassign user
  * view project
  * view history/activity
  * add comments

7. Comments

* Add comments to tasks.
* Each task should support a comment thread or comment list.
* A comment should include:

  * id
  * task id
  * author
  * message
  * createdAt
* Show comments in task detail.
* Add comment form with validation, loading state, and error handling.

8. Priority

* Add priority support to tasks:

  * `low`
  * `medium`
  * `high`
  * optionally `urgent`
* Show priority on task cards and task details.
* Allow filtering by priority.

9. Error handling and loading

* Keep consistent error handling and loading states.
* Handle:

  * board loading
  * task detail loading
  * comment submission loading
  * drag/drop update errors
  * history load errors
* If drag/drop update fails, revert the UI change and show an error message.

10. Architecture

* Keep the implementation typed, scalable, and maintainable.
* Organize code cleanly into:

  * pages
  * routes
  * components
  * board components
  * task detail components
  * services/api
  * types
  * schemas
  * utilities
* Reuse the current patterns already in the app.

11. Suggested UX improvements
    Please also improve the feature with good product thinking. Suggest and implement reasonable extras such as:

* task detail side panel or modal
* optimistic UI updates for drag and drop
* activity badges
* empty states per column
* user avatar or initials
* due date support if useful
* better task card layout
* comment timestamps
* confirmation before destructive actions where appropriate

12. Data model updates
    Update the task model to support:

* description
* priority
* comments
* activity/history
* assignee
* timestamps such as createdAt and updatedAt
* projectId
* status

13. Validation

* Use React Hook Form + Zod for any forms.
* Add validation for task edit forms and comment forms.
* Show field-level errors and global/server errors.

14. Deliverables

* Implement the feature directly.
* Update routes, types, services, and UI.
* Add any missing mock data or seed data needed.
* Preserve existing app behavior while extending it.
* At the end, summarize:

  * what was added
  * which files were created/updated
  * which drag-and-drop library was chosen and why
  * any assumptions made
  * recommended next improvements

Important implementation guidance:

* Prefer a modern drag-and-drop library such as `@dnd-kit`.
* Make the board reusable and not tightly coupled to one page.
* Make sure task status changes create history entries.
* Make sure edits in task detail also create history entries.
* Make sure comments are stored and rendered properly.
* Keep the UI clean and production-style.
