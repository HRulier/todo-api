import { RequestHandler, Request, Response } from "express";

const unknownRoutesHandler: RequestHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `The route ${req.originalUrl} does not exist.`,
  });
};

export default unknownRoutesHandler;
