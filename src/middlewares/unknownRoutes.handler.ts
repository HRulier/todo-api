import { RequestHandler, Request, Response } from "express";
import HTTP_STATUS from "~/utils/http_status";

const unknownRoutesHandler: RequestHandler = (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: "Not Found",
    message: `The route ${req.originalUrl} does not exist.`,
  });
};

export default unknownRoutesHandler;
