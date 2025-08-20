import { Request, Response } from "express";

export interface IJobController {
  sendDailyEmail: (req: Request, res: Response) => void;
}
