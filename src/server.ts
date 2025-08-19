import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "morgan";

import configDotenv from "~/config/dot-env";
import router from "~/routes";

dotenv.config(configDotenv);

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://todo-app.loopness.fr"
        : ["http://localhost:5173", "http://192.168.1.58:5173"],
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Access-Control-Allow-Credentials",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));

router(app);

export default app;
