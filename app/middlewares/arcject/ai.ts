import aj, {
  detectBot,
  sensitiveInfo,
  shield,
  slidingWindow,
} from "@/lib/arcject";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
const buildAiAj = () =>
  aj
    .withRule(
      shield({
        mode: "LIVE",
      })
    )
    .withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: 3,
      })
    )
    .withRule(
      detectBot({
        mode: "LIVE",
        allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
      })
    )
    .withRule(
      sensitiveInfo({
        mode: "LIVE",
        deny: ["CREDIT_CARD_NUMBER", "PHONE_NUMBER"],
      })
    );

export const aiSecurityMiddleware = base
  .$context<{
    request: Request;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const decision = await buildAiAj().protect(context.request, {
      userId: context.user.id,
    });
    if (decision.isDenied()) {
      if (decision.reason.isSensitiveInfo()) {
        throw errors.BAD_REQUEST({
          message:
            "Access denied: Sensitive information detected. Please remove PII (e.g., credit card number, phone number).",
        });
      }

      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "Too many requests: Please wait and try again.",
        });
      }

      if (decision.reason.isBot()) {
        throw errors.FORBIDDEN({
          message: "Access denied: Bot traffic is not allowed.",
        });
      }
      if (decision.reason.isShield()) {
        throw errors.FORBIDDEN({
          message: "Access denied: Your request has been blocked.",
        });
      }
      throw errors.FORBIDDEN({
        message: "Request Blocked.",
      });
    }
    return next();
  });
