import {
  UnauthorizedErrorSchema,
  InternalServerErrorSchema,
} from "~/schemas/error.schema";
import { getErrorResponseConfig } from "../utils";

const unauthorizedResponse = getErrorResponseConfig(
  "Unauthorized",
  UnauthorizedErrorSchema
);

const internalServerResponse = getErrorResponseConfig(
  "Internal server error",
  InternalServerErrorSchema
);

export { unauthorizedResponse, internalServerResponse };
