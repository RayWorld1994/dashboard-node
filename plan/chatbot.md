Act as a senior full-stack engineer and generate a secure MCP-based AI chatbot for my app.

Goal:
I want an AI chatbot connected to my database so I can ask questions about my app data, but it must be strictly read-only and fully respect my app’s authorization rules. Some data must not be exposed depending on the user role, so the chatbot must only return data the current authenticated user is allowed to see.

Core requirements:

* The chatbot is read-only
* It must never create, update, delete, or modify data
* It must enforce the same role and permission rules as the main application
* It must never expose restricted data to unauthorized users
* Authorization must be enforced in backend logic and database access patterns, not only in the prompt

1. Security model
   Build this system with two layers of protection:

A. Database protection

* Use a dedicated read-only database user
* No write permissions at all
* No INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, REVOKE, or schema changes
* Use parameterized queries only
* Add query timeout, result size limits, and pagination

B. Authorization protection

* Every chatbot request must run in the context of the currently authenticated app user
* The chatbot must know:

  * user id
  * email
  * role
  * permissions if applicable
  * tenant/workspace/project scope if applicable
* The chatbot must only access and return data that this user is allowed to see based on the same authorization rules used in the app
* Never expose hidden fields, sensitive records, private comments, admin-only information, or data outside the user’s scope

2. Required behavior
   The chatbot should:

* Answer natural language questions about the app data
* Convert those requests into safe internal tool calls
* Respect role-based access control at all times
* Refuse requests for data the current user is not allowed to see
* Never bypass application authorization logic
* Return only filtered, authorized, least-privilege results

3. Important authorization rule
   Do not let the AI query the database directly without permission filtering.
   The AI must go through an authorization-aware service layer or protected query layer that applies:

* role checks
* ownership checks
* project/team membership checks
* tenant or company scope checks
* field-level visibility rules if needed

Do not rely on “the AI should behave” as the protection.
Enforce access in code.

4. Architecture
   Generate a clean architecture with:

* MCP server layer
* auth context resolver
* authorization-aware service layer
* read-only database layer
* safe tool definitions
* chat orchestration layer
* audit logging
* optional frontend chatbot page/component

5. Tool design
   Prefer narrow safe tools instead of raw SQL.

Examples:

* get_my_projects
* get_project_tasks
* get_my_tasks
* get_visible_users
* get_dashboard_summary
* search_visible_tasks
* get_task_details_if_allowed
* get_project_summary_if_allowed

Each tool must:

* receive the current authenticated user context
* enforce access before querying or returning results
* return only allowed fields
* reject unauthorized access cleanly

Avoid exposing:

* unrestricted raw SQL execution
* unrestricted table browsing
* unrestricted “search everything” tools

6. Role-aware examples
   The generated solution must support examples like:

* admin can see all projects and users allowed by app rules
* manager can only see projects in their scope
* regular user can only see their own tasks or projects they belong to
* restricted users cannot see admin-only metadata
* some task comments/history entries may be hidden depending on permissions

7. Sensitive data controls
   Design the chatbot so it can avoid exposing:

* private user information
* admin-only data
* internal notes
* hidden comments
* audit-only history
* confidential project fields
* records outside the user’s project/team/company scope

Support field-level filtering when needed.
Example:

* a user may see a task title and status
* but not internal notes or admin comments

8. Natural language behavior
   The chatbot should answer questions like:

* "What tasks are assigned to me?"
* "Show my project statuses"
* "What high priority tasks are in Project X that I’m allowed to see?"
* "What changed in my tasks this week?"
* "Show dashboard summary for my visible projects"

The chatbot must refuse or safely limit questions like:

* "Show all users and emails"
* "Show hidden admin notes"
* "Show all projects in the company"
* "Show comments from private tasks"
  when the current user does not have permission.

9. Auditability
   Log every chatbot action with:

* authenticated user id
* role
* user question
* tool invoked
* filters/scopes applied
* timestamp
* whether access was granted, limited, or denied

Do not log secrets or sensitive raw credentials.

10. Frontend chatbot
    If frontend is included:

* build a chat UI
* pass authenticated user context securely through the backend
* do not trust the frontend alone for authorization
* add loading, empty, and error states
* show helpful refusal messages when access is denied
* optionally show “results limited by your permissions” when appropriate

11. PostgreSQL and backend
    Assume PostgreSQL unless stated otherwise.
    Generate:

* a read-only DB role setup
* backend service layer in TypeScript
* protected query functions
* examples of scoped queries
* route/controller such as POST /api/chat/query
* middleware to resolve authenticated user context
* clear separation between auth, authorization, and data access

12. Query restrictions
    If any free-form SQL is allowed internally, it must be:

* SELECT-only
* heavily validated
* scoped by authorization constraints
* blocked from joining unauthorized tables/fields
* limited in rows and execution time

Prefer prebuilt authorized tools instead of SQL generation.

13. Security constraints
    Do not rely only on prompt instructions for security.
    Enforce security with:

* read-only DB credentials
* backend authorization checks
* scoped service methods
* safe output serialization
* field filtering
* rate limiting if useful
* query/result limits
* prompt injection safeguards

14. Deliverables
    Please generate:

* recommended folder structure
* MCP server implementation
* auth context flow
* authorization-aware tool layer
* read-only PostgreSQL setup example
* chatbot backend
* optional frontend chat component
* environment variable examples
* README instructions
* examples of role-based access checks
* examples of filtered responses
* tests or test examples for authorization and read-only behavior

15. Critical rule
    The chatbot must never return data just because it exists in the database.
    It may only return data if the current authenticated user is authorized to see it according to the same rules as the main app.

At the end, summarize:

* architecture
* files created
* security decisions
* authorization decisions
* assumptions
* recommended production hardening steps
