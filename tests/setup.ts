import mongoose from "mongoose";
import dotenv from "dotenv";
import configDotenv from "../src/config/dot-env";
import User from "../src/models/user";
dotenv.config(configDotenv);

// Increase timeout for jest tests
jest.setTimeout(10000);

console.log("test");

// Global hooks for Jest
beforeAll(async () => {
  try {
    // Connect to the database test
    await mongoose.connect(
      `mongodb://127.0.0.1:27017/${process.env.TEST_DATABASE_NAME}`
    );
    console.log("Connected to MongoDb");

    // Create a user for test
    const user = new User({
      email: "test@test.fr",
      password: "?testtest321!",
      profile: {
        firstName: "test",
        lastName: "test",
      },
    });

    await user.save();

    // Create a user for test
    const user2 = new User({
      email: "test2@test.fr",
      password: "?testtest321!",
      profile: {
        firstName: "test",
        lastName: "test",
      },
    });

    await user2.save();
  } catch (error) {
    console.log("Can't connected to MongoDb");
    console.error(error);
  }
});

// Cleaning after tests
afterAll(async () => {
  // Clean up and close connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
