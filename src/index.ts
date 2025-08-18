import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "~/server";
import configDotenv from "~/config/dot-env";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import z from "~/utils/zod/zod-extended";

extendZodWithOpenApi(z);

dotenv.config(configDotenv);

const port = (process.env.PORT || 3000) as number;

const connectToMongoose = async () => {
  try {
    const mongoUri = `${process.env.MONGODB_URI}`;

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    console.error("Please ensure MongoDB is running on your system");
    process.exit(1);
  }
};

app.listen(port, () => {
  console.log(
    `Server running on port ${port} and accessible on all network interfaces`
  );
});

connectToMongoose();
