import request from "supertest";
import { format } from "date-fns";
import app from "../../src/server";
import User from "../../src/models/user";
import Task from "../../src/models/task";
import { TaskSchema } from "../../src/schemas/task.schema";
import { IUser } from "../../src/types/users";
import { TaskDocument } from "../../src/types/task";

let testTask: any;
let testTaskUser2: any;
let user: IUser | any;
let credentials: any = {};

const getTestTasks = (userId: string) => [
  {
    description: "Préparer la présentation pour la réunion client",
    dueDate: "2025-06-27T14:30:00.000+00:00",
    completed: false,
    user: userId,
  },
  {
    description: "Faire les courses pour le week-end",
    dueDate: "2025-07-01T18:45:00.000+00:00",
    completed: true,
    user: userId,
  },
  {
    description: "Réviser le code de l'API REST",
    dueDate: "2025-07-03T08:20:00.000+00:00",
    completed: true,
    user: userId,
  },
  {
    description: "Appeler le médecin pour prendre rendez-vous",
    dueDate: "2025-07-03T11:15:00.000+00:00",
    completed: true,
    user: userId,
  },
  {
    description: "Nettoyer l'appartement avant l'arrivée des invités",
    dueDate: "2025-07-08T21:10:00.000+00:00",
    completed: false,
    user: userId,
  },
];

describe("Tasks endpoints tests", () => {
  beforeAll(async () => {
    user = await User.findOne({ email: "test@test.fr" });
    const user2 = await User.findOne({ email: "test2@test.fr" });

    if (!user || !user2) {
      throw new Error("Error with test users");
    }

    testTask = new Task({
      description: "Lorem ipsum dolor sit amet",
      dueDate: "2025-03-03T14:55:26.078+00:00",
      done: false,
      user: user._id,
    });

    await testTask.save();

    const tasks = getTestTasks(user._id.toString());

    await Task.insertMany(tasks);

    testTaskUser2 = new Task({
      description: "Lorem ipsum dolor sit amet",
      dueDate: "2025-03-03T14:55:26.078+00:00",
      done: false,
      user: user2._id,
    });

    await testTaskUser2.save();

    const { status, body } = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@test.fr",
        password: "?testtest321!",
      })
      .set("Accept", "application/json");

    if (status != 200) {
      throw new Error("Error with login");
    }

    credentials.token = body.token;
    credentials.refreshToken = body.refreshToken;
  });

  afterAll(async () => {
    await Task.deleteMany({});

    await request(app)
      .post("/api/auth/logout")
      .send({
        refreshToken: credentials.refreshToken,
      })
      .set("Accept", "application/json");
  });

  describe("GetTasks", () => {
    it("Should return all tasks for the authenticated user", async () => {
      const {
        status,
        body: { tasks },
      } = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(200);
      expect(tasks.length).toBe(6);
      expect(
        tasks.every((task: TaskDocument) => task.user === user._id.toString())
      ).toBe(true);
    });

    it("Should return completed tasks for the authenticated user", async () => {
      const {
        status,
        body: { tasks },
      } = await request(app)
        .get("/api/tasks?completed")
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(200);
      expect(tasks.length).toBe(3);
      expect(tasks.every((task: TaskDocument) => task.completed)).toBe(true);
    });

    it("Should return not completed tasks for the authenticated user", async () => {
      const {
        status,
        body: { tasks },
      } = await request(app)
        .get("/api/tasks?completed=false")
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(200);
      expect(tasks.length).toBe(3);
      expect(tasks.every((task: TaskDocument) => !task.completed)).toBe(true);
    });

    it("Should return planned tasks on day the 2025-07-03 for the authenticated user", async () => {
      const date = "2025-07-03";
      const {
        status,
        body: { tasks },
      } = await request(app)
        .get(`/api/tasks?minDate=${date}&maxDate=${date}`)
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(200);
      expect(tasks.length).toBe(2);
      expect(
        tasks.every(
          (task: TaskDocument) => format(task.dueDate, "yyyy-MM-dd") === date
        )
      ).toBe(true);
    });

    it("Should return planned tasks between 2025-06-30 and 2025-07-06 for the authenticated user", async () => {
      const minDate = "2025-06-30";
      const maxDate = "2025-07-06";
      const {
        status,
        body: { tasks },
      } = await request(app)
        .get(`/api/tasks?minDate=${minDate}&maxDate=${maxDate}`)
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(200);
      expect(tasks.length).toBe(3);
      // expect(
      //   tasks.every(
      //     (task: TaskDocument) => format(task.date, "yyyy-MM-dd") === date
      //   )
      // ).toBe(true);
    });
  });

  describe("CreateTask", () => {
    it("Should create a task", async () => {
      const newTask = {
        description: "Lorem ipsum dolor sit amet",
        dueDate: "2025-03-03T14:55:26.078+00:00",
      };

      const {
        status,
        body: { task },
      } = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Authorization", `Bearer ${credentials.token}`)
        .set("Accept", "application/json");

      expect(status).toBe(201);
      expect(task.user).toBe(user._id.toString());
      expect(task.completed).toBe(false);
      expect(typeof task.position).toBe("number");

      const validation = TaskSchema.safeParse(task);
      expect(validation.success).toBe(true);
    });

    it("should return 400, invalid data", async () => {
      const newTask = {
        dueDate: "2025-03-03T14:55:26.078+00:00",
      };

      const { status, body } = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .set("Authorization", `Bearer ${credentials.token}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Validation failed");
    });
  });

  describe("GetTaskById", () => {
    it("Should get a task by id", async () => {
      const {
        status,
        body: { task },
      } = await request(app)
        .get(`/api/tasks/${testTask._id.toString()}`)
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(200);
      expect(task.user).toBe(user._id.toString());
      const validation = TaskSchema.safeParse(task);
      expect(validation.success).toBe(true);
    });

    it("Should return 404 if the task is not from the authenticate user", async () => {
      const { status } = await request(app)
        .get(`/api/tasks/${testTaskUser2._id.toString()}`)
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(404);
    });

    it("Should return 404 if the task doesn't exist", async () => {
      const { status } = await request(app)
        .get(`/api/tasks/1111111ae84fa12ddddddddd`)
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(404);
    });
  });

  describe("UpdateTask", () => {
    it("Should update task by id", async () => {
      const updatedTask = {
        description: "Test",
      };

      const {
        status,
        body: { task },
      } = await request(app)
        .put(`/api/tasks/${testTask._id.toString()}`)
        .send(updatedTask)
        .set("Authorization", `Bearer ${credentials.token}`)
        .set("Accept", "application/json");

      expect(status).toBe(200);
      expect(task._id).toBe(testTask._id.toString());
      expect(task.description).toBe("Test");

      const validation = TaskSchema.safeParse(task);
      expect(validation.success).toBe(true);
    });

    it("should return 400, invalid data", async () => {
      const newTask = {
        description: 100,
      };

      const { status, body } = await request(app)
        .put(`/api/tasks/${testTask._id.toString()}`)
        .send(newTask)
        .set("Authorization", `Bearer ${credentials.token}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Validation failed");
    });
  });

  describe("DeleteTask", () => {
    it("should delete task by id", async () => {
      const { status, body } = await request(app)
        .delete(`/api/tasks/${testTask._id.toString()}`)
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(200);
      expect(body.message).toBe("Task successfully removed");
    });

    it("should return 401, unauthorized", async () => {
      const { status } = await request(app).delete(
        `/api/tasks/${testTask._id.toString()}`
      );

      expect(status).toBe(401);
    });
  });
});
