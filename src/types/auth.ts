import { Request, Response } from "express";

export interface IAuthentificateRequest extends Request {
  user?: {
    [_: string]: any;
  };
}

export interface IAuthController {
  register: (req: Request, res: Response) => void;
  login: (req: IAuthentificateRequest, res: Response) => void;
  refresh: (req: Request, res: Response) => void;
  logout: (req: Request, res: Response) => void;
  forgotPassword: (req: Request, res: Response) => void;
  resetPassword: (req: Request, res: Response) => void;
  validateResetPasswordToken: (req: Request, res: Response) => void;
  getProfile: (req: IAuthentificateRequest, res: Response) => void;
  updateProfile: (req: IAuthentificateRequest, res: Response) => void;
}
