import { Response, Request } from "express";

export class CustomError extends Error {
  statusCode = 400;

  constructor(message: string, statusCode?: number) {
    super();
    this.message = message;
    this.statusCode = statusCode || 400;
    // are extending a built-in class
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class InternalError extends Error {
  statusCode = 500;

  constructor(req: Request) {
    super();
    this.message = `Internal server error : ${req.method} ${req.originalUrl}`;
    // are extending a built-in class
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

export class NotFoundError extends Error {
  statusCode = 404;

  constructor(message: string) {
    super();
    this.message = message || "Ressource not found";
    // are extending a built-in class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super();
    this.message = message || "Bad request";
    // are extending a built-in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;

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

  console.log("handleError");
  return res.status(error.statusCode || 500).json({
    error: error.message || internatError.message,
  });
};
