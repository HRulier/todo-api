import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "~/server";
import configDotenv from "~/config/dot-env";

dotenv.config(configDotenv);

const port = process.env.PORT || 3000;

const connectToMongoose = async () => {
  try {
    await mongoose.connect(
      `mongodb://127.0.0.1:27017/${process.env.DATABASE_NAME}`
    );
    console.log("Connected to MongoDb");
  } catch (err) {
    console.error(err);
  }
};

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

connectToMongoose();
