import request from "supertest";
import dotenv from "dotenv";
import app from "~/server";
import Operation from "~/models/operation";
import configDotenv from "~/config/dot-env";

dotenv.config(configDotenv);

describe("Operation endpoints tests", () => {
  afterAll(async () => {
    await Operation.deleteMany({});
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
});
