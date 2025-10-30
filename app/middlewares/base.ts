import { os } from "@orpc/server";

export const base = os.$context<{ request: Request }>().errors({
  RATE_LIMITED: {
    message: "Too many requests, please try again later.",
    status: 429,
  },
  BAD_REQUEST: {
    message: "The request was invalid.",
    status: 400,
  },
  NOT_FOUND: {
    message: "The requested resource was not found.",
    status: 404,
  },
  FORBIDDEN: {
    message: "You do not have permission to access this resource.",
    status: 403,
  },
  UNAUTHORIZED: {
    message: "You are not authorized to access this resource.",
    status: 401,
  },
  INTERNAL_SERVER_ERROR: {
    message: "An unexpected error occurred on the server.",
    status: 500,
  },
});
