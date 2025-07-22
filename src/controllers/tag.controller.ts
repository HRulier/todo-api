import { Response } from "express";
import HTTP_STATUS from "~/utils/http_status";
import { handleError, CustomError } from "~/utils/errors";
import { ITagController } from "~/types/tag";
import { IAuthentificateRequest } from "~/types/auth";
import { IUser } from "~/types/users";
import Tag from "~/models/tag";

const PASTEL_COLORS = [
  "#FFB3E6", // Rose pastel
  "#B3E5FF", // Bleu ciel pastel
  "#B3FFB3", // Vert menthe pastel
  "#FFD9B3", // Orange pastel
  "#E6B3FF", // Violet pastel
  "#FFFFB3", // Jaune pastel
  "#FFB3B3", // Rouge pastel
  "#B3FFFF", // Cyan pastel
  "#D9B3FF", // Lavande pastel
  "#B3FFD9", // Vert eau pastel
  "#FFE6B3", // Pêche pastel
  "#F0B3FF", // Magenta pastel
];

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
