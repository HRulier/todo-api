import { Request, Response, NextFunction } from "express";

export interface IAuthentificateRequest extends Request {
  user?: {
    [_: string]: any;
  };
}

export interface IAuthController {
  login: (req: Request, res: Response) => void;
  register: (req: Request, res: Response, next: NextFunction) => void;
  forgotPassword: (req: Request, res: Response) => void;
  resetPassword: (req: Request, res: Response) => void;
  getProfile: (req: Request, res: Response) => void;
  updateProfile: (req: IAuthentificateRequest, res: Response) => void;
}
