import { Router } from "express";
import { summaryHandler } from "../controllers/dashboard.controller";
import { projectsHandler } from "../controllers/projects.controller";
import { tasksHandler } from "../controllers/tasks.controller";
import { usersHandler } from "../controllers/users.controller";
import { activityHandler } from "../controllers/activity.controller";
import { authenticateToken } from "../middleware/auth";

// All /api/* routes require a valid JWT.
// authenticateToken is applied once here rather than repeating it on every route.
const apiRouter = Router();
apiRouter.use(authenticateToken);

apiRouter.get("/dashboard/summary", summaryHandler);
apiRouter.get("/projects", projectsHandler);
apiRouter.get("/tasks", tasksHandler);
apiRouter.get("/users", usersHandler);
apiRouter.get("/activity", activityHandler);

export { apiRouter };
