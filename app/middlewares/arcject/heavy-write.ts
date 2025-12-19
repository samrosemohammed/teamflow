import arcject, { sensitiveInfo, slidingWindow } from "@/lib/arcject";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const buildStandardAj = () =>
  arcject
    .withRule(
      // algorithm: sliding window
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: 2,
      })
    )
    .withRule(
      sensitiveInfo({
        mode: "LIVE",
        deny: ["CREDIT_CARD_NUMBER", "PHONE_NUMBER"],
      })
    );

export const heavyWriteSecurityMiddleware = base
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

      if (decision.reason.isSensitiveInfo()) {
        throw errors.BAD_REQUEST({
          message:
            "Access denied: Sensitive information detected. Please remove PII (e.g., credit card number, phone number).",
        });
      }

      throw errors.FORBIDDEN({
        message: "Access denied: Your request has been blocked.",
      });
    }
    return next();
  });
