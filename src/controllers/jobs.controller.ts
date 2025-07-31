import { Request, Response } from "express";
import HTTP_STATUS from "~/utils/http_status";
import { handleError } from "~/utils/errors";
import { sendDailyEmailToUsers } from "~/services/users.services";
import type { IJobController } from "~/types/jobs";

async function sendDailyEmail(req: Request, res: Response) {
  try {
    await sendDailyEmailToUsers();

    return res.status(HTTP_STATUS.OK).json({ message: "Emails sent" });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

const JobsController: IJobController = {
  sendDailyEmail,
};

export default JobsController;
