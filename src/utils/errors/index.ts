import { Response, Request } from "express";
import HTTP_STATUS from "../http_status";

export class CustomError extends Error {
  statusCode = HTTP_STATUS.BAD_REQUEST as number;

  constructor(message: string, statusCode?: number) {
    super();
    this.message = message;
    this.statusCode = statusCode || HTTP_STATUS.BAD_REQUEST;
    // are extending a built-in class
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class InternalError extends Error {
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

  constructor(req: Request) {
    super();
    this.message = `Internal server error : ${req.method} ${req.originalUrl}`;
    // are extending a built-in class
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

export class NotFoundError extends Error {
  statusCode = HTTP_STATUS.NOT_FOUND;

  constructor(message: string) {
    super();
    this.message = message || "Ressource not found";
    // are extending a built-in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends Error {
  statusCode = HTTP_STATUS.BAD_REQUEST;

  constructor(message: string) {
    super();
    this.message = message || "Bad request";
    // are extending a built-in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends Error {
  statusCode = HTTP_STATUS.UNAUTHORIZED;

  constructor(message?: string) {
    super();
    this.message = message || "Unauthorized";
    // are extending a built-in class
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export const handleError = (res: Response, req: Request, error: any) => {
  const internatError = new InternalError(req);
  // console.log('InternalError', internatError);
  // console.log(error.statusCode, error.message);

  return res
    .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json({
      status: "error",
      message: error.message || internatError.message,
      errors: [],
    });
};
