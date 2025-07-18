import request from "supertest";
import app from "~/server";
import User from "~/models/user";
import Task from "~/models/task";
import Category from "~/models/category";
import type { IUser } from "~/types/users";

let user: IUser | any;
let credentials: any = {};

describe("Categories endpoints tests", () => {
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

    // Add Categories

    await Category.insertMany([
      {
        label: "Categorie 1",
        user: user._id,
      },
      {
        label: "Categorie 2",
        user: user._id,
      },
    ]);
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await Category.deleteMany({});
  });

  describe("Categories", () => {
    it("Categories", () => {
      expect(true).toBe(true);
    });
  });

  // describe("GetCategories", () => {
  //   it("Should get categories for authenticated user", async () => {
  //     const {
  //       status,
  //       body: { categories },
  //     } = await request(app)
  //       .get("/api/categories")
  //       .set("Authorization", `Bearer ${credentials.token}`);

  //     expect(status).toBe(200);
  //     expect(categories.length).toBe(2);

  //     expect(
  //       categories.every(
  //         (category: any) => category.user === user._id.toString()
  //       )
  //     ).toBe(true);
  //   });
  // });
});
