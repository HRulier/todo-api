import { Response } from "express";
import HTTP_STATUS from "~/utils/http_status";
import { handleError, CustomError } from "~/utils/errors";
import { ITagController } from "~/types/tags";
import { IAuthentificateRequest } from "~/types/auth";
import { IUser } from "~/types/users";
import Tag from "~/models/tag";
import PASTEL_COLORS from "~/constants/pastel-colors";

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

    const existingTag = await Tag.findOne({
      user: user._id,
      label,
    });

    if (existingTag) {
      throw new CustomError("Tag already exists", HTTP_STATUS.CONFLICT);
    }

    const countTags = await Tag.countDocuments({
      user: user._id,
    });

    const color = PASTEL_COLORS[countTags % PASTEL_COLORS.length];

    const tag = new Tag({
      user: user._id,
      label,
      color,
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
