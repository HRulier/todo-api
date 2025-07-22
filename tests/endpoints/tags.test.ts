import request from "supertest";
import app from "~/server";
import User from "~/models/user";
import Task from "~/models/task";
import Tag from "~/models/tag";
import type { IUser } from "~/types/users";

let user: IUser | any;
let credentials: any = {};

describe("Tags endpoints tests", () => {
  beforeAll(async () => {
    user = await User.findOne({ email: "test@test.fr" });

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

    // Add Tags

    await Tag.insertMany([
      {
        label: "Tag 1",
        user: user._id,
      },
      {
        label: "Tag 2",
        user: user._id,
      },
    ]);
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await Tag.deleteMany({});
  });

  describe("GetTags", () => {
    it("Should get tags for authenticated user", async () => {
      const {
        status,
        body: { tags },
      } = await request(app)
        .get("/api/tags")
        .set("Authorization", `Bearer ${credentials.token}`);

      expect(status).toBe(200);
      expect(tags.length).toBe(2);

      expect(tags.every((tag: any) => tag.user === user._id.toString())).toBe(
        true
      );
    });
  });

  describe("CreateTag", () => {
    it("Should create tag for authenticated user", async () => {
      const {
        status,
        body: { tag },
      } = await request(app)
        .post("/api/tags")
        .send({
          label: "Nouveau tag",
        })
        .set("Authorization", `Bearer ${credentials.token}`)
        .set("Accept", "application/json");

      expect(status).toBe(201);

      expect(tag.label).toBe("Nouveau tag");

      expect(tag.user === user._id.toString()).toBe(true);
    });

    it("should return 400, invalid data", async () => {
      const { status, body } = await request(app)
        .post("/api/tags")
        .send({
          label: 100,
        })
        .set("Authorization", `Bearer ${credentials.token}`)
        .set("Accept", "application/json");

      expect(status).toBe(400);
      expect(body.status).toBe("error");
      expect(body.message).toBe("Validation failed");
    });
  });
});
