import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { isValid } from "date-fns";
import { FilterQuery } from "mongoose";
import Task from "~/models/task";
// import Tag from "~/models/tag";
// import PASTEL_COLORS from "~/constants/pastel-colors";

const populateTask = [{ path: "tags", select: "_id label color" }];

// extra.authInfo is set by our authenticateOAuthToken middleware via req.auth.
// userId lives in the AuthInfo.extra bag since it's not part of the standard spec.
function getUserId(extra: {
  authInfo?: { extra?: Record<string, unknown> };
}): string | null {
  return (extra.authInfo?.extra?.userId as string) ?? null;
}

function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function err(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: "todo-api", version: "1.0.0" });

  // ── list_tasks ──────────────────────────────────────────────────────────────
  server.registerTool(
    "list_tasks",
    {
      description:
        "List tasks for the authenticated user with optional filters",
      inputSchema: {
        completed: z
          .boolean()
          .optional()
          .describe("Filter by completion status"),
        minDate: z
          .string()
          .optional()
          .describe("ISO date — tasks due on or after this date"),
        maxDate: z
          .string()
          .optional()
          .describe("ISO date — tasks due on or before this date"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ completed, minDate, maxDate }, extra) => {
      const userId = getUserId(extra);
      if (!userId) return err("Unauthorized");

      const query: FilterQuery<unknown> = { user: userId };
      if (typeof completed === "boolean") query.completed = completed;

      const parsedMin = minDate ? new Date(minDate) : null;
      const parsedMax = maxDate ? new Date(maxDate) : null;

      if (
        (parsedMin && isValid(parsedMin)) ||
        (parsedMax && isValid(parsedMax))
      ) {
        query.dueDate = {};
        if (parsedMin && isValid(parsedMin)) query.dueDate.$gte = parsedMin;
        if (parsedMax && isValid(parsedMax)) query.dueDate.$lte = parsedMax;
      }

      const tasks = await Task.find(query)
        .populate(populateTask)
        .sort({ dueDate: 1, position: 1 });
      return ok({ tasks });
    },
  );

  // ── get_task ─────────────────────────────────────────────────────────────────
  server.registerTool(
    "get_task",
    {
      description: "Get a single task by ID",
      inputSchema: { id: z.string().describe("Task MongoDB ID") },
      annotations: { readOnlyHint: true },
    },
    async ({ id }, extra) => {
      const userId = getUserId(extra);
      if (!userId) return err("Unauthorized");

      const task = await Task.findOne({ _id: id, user: userId }).populate(
        populateTask,
      );
      if (!task) return err("Task not found");
      return ok({ task });
    },
  );

  // // ── create_task ───────────────────────────────────────────────────────────────
  // server.registerTool(
  //   "create_task",
  //   {
  //     description: "Create a new task",
  //     inputSchema: {
  //       description: z.string().describe("Task description"),
  //       dueDate: z
  //         .string()
  //         .describe("ISO date string for when the task is due"),
  //       priority: z.enum(["low", "medium", "high"]).optional().default("low"),
  //       tags: z
  //         .array(z.string())
  //         .optional()
  //         .describe("Array of tag IDs to attach"),
  //     },
  //   },
  //   async ({ description, dueDate, priority, tags }, extra) => {
  //     const userId = getUserId(extra);
  //     if (!userId) return err("Unauthorized");

  //     const due = new Date(dueDate);
  //     if (!isValid(due))
  //       return err("Invalid dueDate — must be a valid ISO date string");

  //     const minPositionTask = await Task.findOne({
  //       user: userId,
  //       dueDate: due,
  //     }).sort({ position: 1 });
  //     const position = minPositionTask ? minPositionTask.position - 1 : 1024;

  //     const task = new Task({
  //       description,
  //       dueDate: due,
  //       priority,
  //       tags: tags ?? [],
  //       user: userId,
  //       position,
  //     });
  //     await task.save();
  //     await Task.populate(task, populateTask);
  //     return ok({ task });
  //   },
  // );

  // // ── update_task ───────────────────────────────────────────────────────────────
  // server.registerTool(
  //   "update_task",
  //   {
  //     description: "Update an existing task",
  //     inputSchema: {
  //       id: z.string().describe("Task MongoDB ID"),
  //       description: z.string().optional(),
  //       dueDate: z.string().optional().describe("ISO date string"),
  //       completed: z.boolean().optional(),
  //       priority: z.enum(["low", "medium", "high"]).optional(),
  //       tags: z
  //         .array(z.string())
  //         .optional()
  //         .describe("Replace the full list of tag IDs"),
  //     },
  //   },
  //   async ({ id, ...updates }, extra) => {
  //     const userId = getUserId(extra);
  //     if (!userId) return err("Unauthorized");

  //     const updateData: Record<string, unknown> = { ...updates };
  //     if (updates.dueDate) {
  //       const due = new Date(updates.dueDate);
  //       if (!isValid(due)) return err("Invalid dueDate");
  //       updateData.dueDate = due;
  //     }

  //     const task = await Task.findOneAndUpdate(
  //       { _id: id, user: userId },
  //       updateData,
  //       { new: true },
  //     ).populate(populateTask);

  //     if (!task) return err("Task not found");
  //     return ok({ task });
  //   },
  // );

  // // ── delete_task ───────────────────────────────────────────────────────────────
  // server.registerTool(
  //   "delete_task",
  //   {
  //     description: "Delete a task by ID",
  //     inputSchema: { id: z.string().describe("Task MongoDB ID") },
  //   },
  //   async ({ id }, extra) => {
  //     const userId = getUserId(extra);
  //     if (!userId) return err("Unauthorized");

  //     const task = await Task.findOneAndDelete({ _id: id, user: userId });
  //     if (!task) return err("Task not found");
  //     return ok({ message: "Task deleted" });
  //   },
  // );

  // // ── list_tags ─────────────────────────────────────────────────────────────────
  // server.registerTool(
  //   "list_tags",
  //   {
  //     description: "List all tags for the authenticated user",
  //     inputSchema: {},
  //     annotations: { readOnlyHint: true },
  //   },
  //   async (_args, extra) => {
  //     const userId = getUserId(extra);
  //     if (!userId) return err("Unauthorized");

  //     const tags = await Tag.find({ user: userId });
  //     return ok({ tags });
  //   },
  // );

  // // ── create_tag ────────────────────────────────────────────────────────────────
  // server.registerTool(
  //   "create_tag",
  //   {
  //     description: "Create a new tag (color is auto-assigned)",
  //     inputSchema: {
  //       label: z.string().describe("Tag label — must be unique per user"),
  //     },
  //   },
  //   async ({ label }, extra) => {
  //     const userId = getUserId(extra);
  //     if (!userId) return err("Unauthorized");

  //     const existing = await Tag.findOne({ user: userId, label });
  //     if (existing) return err("Tag with this label already exists");

  //     const count = await Tag.countDocuments({ user: userId });
  //     const color = PASTEL_COLORS[count % PASTEL_COLORS.length];

  //     const tag = new Tag({ user: userId, label, color });
  //     await tag.save();
  //     return ok({ tag });
  //   },
  // );

  return server;
}
