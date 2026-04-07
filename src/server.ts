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
    origin: process.env.FRONT_URL_CORS_ORIGIN,
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
  }),
);

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));

router(app);

export default app;
