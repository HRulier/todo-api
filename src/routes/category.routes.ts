import { Router } from "express";
import CategoryController from "~/controllers/category.controller";
import { requireAuth } from "~/middlewares/auth.handler";

const categoriesRoutes = Router();

categoriesRoutes.get("/", requireAuth, CategoryController.getCategories);

export default categoriesRoutes;
