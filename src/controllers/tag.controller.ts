import { Response } from "express";
import HTTP_STATUS from "~/utils/http_status";
import { handleError } from "~/utils/errors";
import { ITagController } from "~/types/tag";
import { IAuthentificateRequest } from "~/types/auth";
import { IUser } from "~/types/users";
import Tag from "~/models/tag";

async function getTags(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;

    const tags = await Tag.find({
      user: user._id,
    });

    return res.status(HTTP_STATUS.OK).json({ tags });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

async function createTags(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;
    const { label } = req.body;

    const tag = new Tag({
      user: user._id,
      label,
    });

    tag.save();

    return res.status(HTTP_STATUS.CREATED).json({ tag });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

const TagController: ITagController = {
  getTags,
  createTags,
};

export default TagController;
