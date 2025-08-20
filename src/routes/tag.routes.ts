import { Router } from "express";
import TagController from "~/controllers/tags.controller";
import { requireAuth } from "~/middlewares/auth.handler";
import validateRequest from "~/middlewares/validateRequest.handler";
import { CreateTagSchema } from "~/schemas/tag.schema";

const tagsRoutes = Router();

tagsRoutes.get("/", requireAuth, TagController.getTags);
tagsRoutes.post(
  "/",
  requireAuth,
  validateRequest({ body: CreateTagSchema }),
  TagController.createTags
);

export default tagsRoutes;
