import { Router } from "express";
import { summaryHandler } from "../controllers/dashboard.controller";
import {
  projectsHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from "../controllers/projects.controller";
import {
  tasksHandler,
  taskDetailHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  taskHistoryHandler,
} from "../controllers/tasks.controller";
import {
  usersHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "../controllers/users.controller";
import { activityHandler } from "../controllers/activity.controller";
import { boardHandler } from "../controllers/board.controller";
import {
  taskCommentsHandler,
  addCommentHandler,
} from "../controllers/comments.controller";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { chatQueryHandler } from "../controllers/chat.controller";

const apiRouter = Router();
apiRouter.use(authenticateToken);

// ── Dashboard ─────────────────────────────────────────────────────────────
apiRouter.get("/dashboard/summary", summaryHandler);
apiRouter.get("/activity", activityHandler);

// ── Projects ──────────────────────────────────────────────────────────────
apiRouter.get("/projects", projectsHandler);
apiRouter.post("/projects", createProjectHandler);
apiRouter.patch("/projects/:id", updateProjectHandler);
apiRouter.delete("/projects/:id", requireAdmin, deleteProjectHandler);

// ── Project board ─────────────────────────────────────────────────────────
apiRouter.get("/projects/:projectId/board", boardHandler);

// ── Tasks ─────────────────────────────────────────────────────────────────
apiRouter.get("/tasks", tasksHandler);
apiRouter.post("/tasks", createTaskHandler);
apiRouter.get("/tasks/:id", taskDetailHandler);
apiRouter.patch("/tasks/:id", updateTaskHandler);
apiRouter.delete("/tasks/:id", requireAdmin, deleteTaskHandler);

// ── Task sub-resources ────────────────────────────────────────────────────
apiRouter.get("/tasks/:id/comments", taskCommentsHandler);
apiRouter.post("/tasks/:id/comments", addCommentHandler);
apiRouter.get("/tasks/:id/history", taskHistoryHandler);

// ── Chatbot ───────────────────────────────────────────────────────────────
apiRouter.post("/chat/query", chatQueryHandler);

// ── Users (profiles) ──────────────────────────────────────────────────────
apiRouter.get("/users", usersHandler);
apiRouter.post("/users", requireAdmin, createUserHandler);
apiRouter.patch("/users/:id", requireAdmin, updateUserHandler);
apiRouter.delete("/users/:id", requireAdmin, deleteUserHandler);

export { apiRouter };
