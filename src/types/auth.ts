import { NextFunction, Request, Response } from "express";

export interface IAuthentificateRequest extends Request {
  user?: {
    [_: string]: any;
  };
}

export interface IAuthController {
  register: (req: Request, res: Response) => void;
  login: (req: IAuthentificateRequest, res: Response) => void;
  loginWithGoogle: (req: Request, res: Response, next: NextFunction) => void;
  loginWithGoogleCallback: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
  refresh: (req: Request, res: Response) => void;
  logout: (req: Request, res: Response) => void;
  forgotPassword: (req: Request, res: Response) => void;
  resetPassword: (req: Request, res: Response) => void;
  resetPasswordRedirect: (req: Request, res: Response) => void;
  verifiedUserEmail: (req: Request, res: Response) => void;
  resendVerificationEmail: (req: Request, res: Response) => void;
  getProfile: (req: IAuthentificateRequest, res: Response) => void;
  updateProfile: (req: IAuthentificateRequest, res: Response) => void;
}
