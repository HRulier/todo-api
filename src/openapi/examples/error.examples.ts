import { getErrorResponseConfig } from "../utils";

const unauthorizedResponse = getErrorResponseConfig("Unauthorized", {
  status: "error",
  message: "Invalid or expired token. Please log in again.",
  errors: [],
});

const internalServerResponse = getErrorResponseConfig("Internal server error", {
  status: "error",
  message: "InternalError",
  errors: [],
});

export { unauthorizedResponse, internalServerResponse };
