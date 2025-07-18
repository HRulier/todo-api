import mongoose from "mongoose";
import dotenv from "dotenv";
import configDotenv from "../src/config/dot-env";
import User from "../src/models/user";
dotenv.config(configDotenv);

// Increase timeout for jest tests
jest.setTimeout(10000);

const user = {
  email: "test@test.fr",
  password: "?testtest321!",
  isVerified: true,
  profile: {
    firstName: "test",
    lastName: "test",
  },
};

const user2 = {
  email: "test2@test.fr",
  password: "?testtest321!",
  isVerified: true,
  profile: {
    firstName: "test",
    lastName: "test",
  },
};

// Global hooks for Jest
beforeAll(async () => {
  try {
    // Connect to the database test
    await mongoose.connect(
      `mongodb://127.0.0.1:27017/${process.env.TEST_DATABASE_NAME}`
    );
    // console.log("Connected to MongoDb");

    await mongoose.connection.dropDatabase();

    const newUser = new User(user);
    await newUser.save();

    const newUser2 = new User(user2);
    await newUser2.save();
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
