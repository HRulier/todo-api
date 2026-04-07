import request from "supertest";
import dotenv from "dotenv";
import app from "~/server";
import Operation from "~/models/operation";
import User from "~/models/user";
import Task from "~/models/task";
import configDotenv from "~/config/dot-env";

dotenv.config(configDotenv);

describe("Operation endpoints tests", () => {
  let slackUser: any;
  
  beforeAll(async () => {
    // Create a Slack user for testing PATCH operations
    slackUser = new User({
      email: "slackuser@test.com",
      password: "?testtest321!",
      isVerified: true,
      slackId: "U09DRSE6HDW",
      profile: {
        firstName: "Slack",
        lastName: "User",
      },
    });
    await slackUser.save();
  });

  afterAll(async () => {
    await Operation.deleteMany({});
    await Task.deleteMany({});
    await User.deleteOne({ email: "slackuser@test.com" });
  });

  describe("POST /operations", () => {
    afterEach(async () => {
      await Operation.deleteMany({});
    });

    it("Should create a new operation", async () => {
      const operationData = {
        source: "slack",
        type: "bulk_create_tasks",
        user: "U09DRSE6HDW",
        payload: {
          tasks: [
            {
              description: "Task 1",
              dueDate: "2025-07-18T14:55:37.403Z",
            },
            {
              description: "Task 2",
              dueDate: "2025-07-18T14:55:37.403Z",
            },
          ],
        },
        metadata: {
          channel: "D09D3PD3RB8",
          approvedBy: null,
          approvedAt: null,
        },
      };

      const { status, body } = await request(app)
        .post("/api/operations")
        .send(operationData)
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(201);
      expect(body).toHaveProperty("operation");
      expect(body.operation.source).toBe(operationData.source);
      expect(body.operation.type).toBe(operationData.type);
      expect(body.operation.status).toBe("pending"); // Default status
      expect(body.operation.payload).toEqual(operationData.payload);
      expect(body.operation.metadata.channel).toBe(
        operationData.metadata.channel
      );
    });

    it("Should create operation without metadata", async () => {
      const operationData = {
        source: "slack",
        type: "bulk_create_tasks",
        user: "U09DRSE6HDW",
        payload: {
          tasks: [
            {
              description: "Task 1",
              dueDate: "2025-07-18T14:55:37.403Z",
            },
          ],
        },
      };

      const { status, body } = await request(app)
        .post("/api/operations")
        .send(operationData)
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(201);
      expect(body).toHaveProperty("operation");
      expect(body.operation.source).toBe(operationData.source);
      expect(body.operation.type).toBe(operationData.type);
      expect(body.operation.metadata).toEqual({
        approvedBy: null,
        approvedAt: null,
        channel: null,
      });
    });

    it("Should return 401 for unauthenticated request", async () => {
      const operationData = {
        source: "slack",
        type: "bulk_create_tasks",
        payload: {
          tasks: [{ description: "Unauthorized Task" }],
        },
      };

      const { status } = await request(app)
        .post("/api/operations")
        .send(operationData)
        .set("Accept", "application/json");

      expect(status).toBe(401);
    });

    it("Should return validation error for invalid source", async () => {
      const operationData = {
        source: "invalid_source",
        type: "bulk_create_tasks",
        payload: {
          tasks: [{ description: "Task with invalid source" }],
        },
      };

      const { status } = await request(app)
        .post("/api/operations")
        .send(operationData)
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
    });

    it("Should return validation error for invalid type", async () => {
      const operationData = {
        source: "slack",
        type: "invalid_type",
        payload: {
          tasks: [{ description: "Task with invalid type" }],
        },
      };

      const { status } = await request(app)
        .post("/api/operations")
        .send(operationData)
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
    });

    it("Should return validation error for missing required fields", async () => {
      const { status } = await request(app)
        .post("/api/operations")
        .send({})
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
    });

    it("Should return validation error for missing payload", async () => {
      const operationData = {
        source: "slack",
        type: "bulk_create_tasks",
      };

      const { status } = await request(app)
        .post("/api/operations")
        .send(operationData)
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
    });
  });

  describe("PATCH /operations/:shortId", () => {
    let testOperation: any;
    
    beforeEach(async () => {
      // Create a pending operation for testing
      testOperation = new Operation({
        user: slackUser._id,
        source: "slack",
        type: "bulk_create_tasks",
        status: "pending",
        payload: {
          tasks: [
            {
              description: "Test Task 1",
              dueDate: "2025-07-18T14:55:37.403Z",
            },
            {
              description: "Test Task 2", 
              dueDate: "2025-07-18T14:55:37.403Z",
            },
          ],
        },
        metadata: {
          channel: "D09D3PD3RB8",
          approvedBy: null,
          approvedAt: null,
        },
      });
      await testOperation.save();
    });

    afterEach(async () => {
      await Operation.deleteMany({});
      await Task.deleteMany({});
    });

    it("Should approve operation and create tasks", async () => {
      const { status, body } = await request(app)
        .patch(`/api/operations/${testOperation.shortId}`)
        .send({ status: "approved" })
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(200);
      expect(body).toHaveProperty("operation");
      expect(body.operation.status).toBe("approved");
      expect(body.operation.shortId).toBe(testOperation.shortId);

      // Verify tasks were created
      const createdTasks = await Task.find({ user: slackUser._id });
      expect(createdTasks).toHaveLength(2);
      expect(createdTasks[0].description).toBe("Test Task 1");
      expect(createdTasks[1].description).toBe("Test Task 2");
    });

    it("Should reject operation without creating tasks", async () => {
      const { status, body } = await request(app)
        .patch(`/api/operations/${testOperation.shortId}`)
        .send({ status: "rejected" })
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(200);
      expect(body).toHaveProperty("operation");
      expect(body.operation.status).toBe("rejected");
      expect(body.operation.shortId).toBe(testOperation.shortId);

      // Verify no tasks were created
      const createdTasks = await Task.find({ user: slackUser._id });
      expect(createdTasks).toHaveLength(0);
    });

    it("Should return 404 for non-existent operation", async () => {
      const { status, body } = await request(app)
        .patch("/api/operations/NONEXISTENT")
        .send({ status: "approved" })
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(404);
      expect(body.message).toBe("The requested operation doest not exist or has already been executed");
    });

    it("Should return 404 for already processed operation", async () => {
      // First approve the operation
      await request(app)
        .patch(`/api/operations/${testOperation.shortId}`)
        .send({ status: "approved" })
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      // Try to approve again
      const { status, body } = await request(app)
        .patch(`/api/operations/${testOperation.shortId}`)
        .send({ status: "rejected" })
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(404);
      expect(body.message).toBe("The requested operation doest not exist or has already been executed");
    });

    it("Should return 401 for missing API key", async () => {
      const { status } = await request(app)
        .patch(`/api/operations/${testOperation.shortId}`)
        .send({ status: "approved" })
        .set("Accept", "application/json");

      expect(status).toBe(401);
    });

    it("Should return 400 for invalid status", async () => {
      const { status } = await request(app)
        .patch(`/api/operations/${testOperation.shortId}`)
        .send({ status: "invalid_status" })
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
    });

    it("Should return 400 for missing status", async () => {
      const { status } = await request(app)
        .patch(`/api/operations/${testOperation.shortId}`)
        .send({})
        .set("x-api-key", `${process.env.API_KEY}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
    });
  });
});
