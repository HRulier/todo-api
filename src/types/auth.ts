import { Request, Response } from "express";

export interface IAuthentificateRequest extends Request {
  user?: {
    [_: string]: any;
  };
}

export interface IAuthController {
  login: (req: IAuthentificateRequest, res: Response) => Promise<Response>;
  register: (req: Request, res: Response) => Promise<Response>;
  forgotPassword: (req: Request, res: Response) => Promise<Response>;
  resetPassword: (req: Request, res: Response) => Promise<Response>;
  getProfile: (req: IAuthentificateRequest, res: Response) => Promise<Response>;
  updateProfile: (
    req: IAuthentificateRequest,
    res: Response
  ) => Promise<Response>;
}
