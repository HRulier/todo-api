import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { CustomError, handleError } from "~/utils/errors";
import envConfig from "~/config/dot-env";
import HTTP_STATUS from "~/utils/http_status";

dotenv.config(envConfig);

const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers["x-api-key"];
    if (key !== process.env.API_KEY) {
      throw new CustomError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }
    next();
  } catch (error) {
    handleError(res, req, error);
  }
};

export default verifyApiKey;
