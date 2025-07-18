import { Response } from "express";
import HTTP_STATUS from "~/utils/http_status";
import { handleError } from "~/utils/errors";
import { ICategoryController } from "~/types/category";
import { IAuthentificateRequest } from "~/types/auth";
import { IUser } from "~/types/users";
import Category from "~/models/category";

async function getCategories(req: IAuthentificateRequest, res: Response) {
  try {
    const user = req.user as IUser;

    const categories = await Category.find({
      user: user._id,
    });

    return res.status(HTTP_STATUS.OK).json({ categories });
  } catch (error: unknown) {
    return handleError(res, req, error);
  }
}

const CategoryController: ICategoryController = {
  getCategories,
};

export default CategoryController;
