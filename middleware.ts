import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextMiddleware, NextRequest, NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "CATEGORY:MONITOR",
        "CATEGORY:MONITOR",
      ],
    }),
  ],
});

const existingMiddleware = async (req: NextRequest) => {
  const anyReq = req as {
    nextUrl: NextRequest["nextUrl"];
    kindeAuth?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token?: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user?: any;
    };
  };
  const url = req.nextUrl;
  const orgCode =
    anyReq.kindeAuth?.user?.org_code ||
    anyReq.kindeAuth?.token?.claims?.org_code ||
    anyReq.kindeAuth?.token?.org_code;

  if (
    url.pathname.startsWith("/workspace") &&
    !url.pathname.includes(orgCode || "")
  ) {
    url.pathname = `/workspace/${orgCode}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
};

export default createMiddleware(
  aj,
  withAuth(existingMiddleware, {
    publicPaths: ["/", "/api/uploadthing"],
  }) as NextMiddleware
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"],
};
