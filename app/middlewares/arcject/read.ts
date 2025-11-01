import arcject, { slidingWindow } from "@/lib/arcject";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const buildStandardAj = () =>
  arcject.withRule(
    // algorithm: sliding window
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 180,
    })
  );

export const readSecurityMiddleware = base
  .$context<{
    request: Request;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decision = await buildStandardAj().protect(context.request, {
      userId: context.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "Access denied: Rate limit exceeded.",
        });
      }

      throw errors.FORBIDDEN({
        message: "Access denied: Your request has been blocked.",
      });
    }
    return next();
  });
