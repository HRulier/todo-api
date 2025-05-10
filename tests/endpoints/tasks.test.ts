import request from "supertest";
import app from "../../src/server";
import User from "../../src/models/user";
import Task from "../../src/models/task";
import { TaskSchema } from "../../src/schemas/task.schema";
import { IUser } from "../../src/types/users";

let testTask: any;
let testTaskUser2: any;
let user: IUser | any;
let credentials: any = {};

describe("Tasks endpoints tests", () => {
  beforeAll(async () => {
    user = await User.findOne({ email: "test@test.fr" });
    const user2 = await User.findOne({ email: "test2@test.fr" });

    if (!user || !user2) {
      throw new Error("Error with test users");
    }

    testTask = new Task({
      description: "Lorem ipsum dolor sit amet",
      date: "2025-03-03T14:55:26.078+00:00",
      done: false,
      user: user._id,
    });

    await testTask.save();

    testTaskUser2 = new Task({
      description: "Lorem ipsum dolor sit amet",
      date: "2025-03-03T14:55:26.078+00:00",
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

  // describe("GetAllTasks", () => {
  //   it("Should return all tasks", () => {
  //     console.log("test");
  //   });
  // });

  describe("CreateTask", () => {
    it("Should create a task", async () => {
      const newTask = {
        description: "Lorem ipsum dolor sit amet",
        date: "2025-03-03T14:55:26.078+00:00",
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

      const validation = TaskSchema.safeParse(task);
      expect(validation.success).toBe(true);
    });

    it("should return 400, invalid data", async () => {
      const newProduct = {
        date: "2025-03-03T14:55:26.078+00:00",
      };

      const { status, body } = await request(app)
        .post("/api/tasks")
        .send(newProduct)
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
