import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isProduction = process.env.NODE_ENV === "production";
  const secure = isProduction ? true : isSecureRequest(req);

  // Use "lax" in production for better CSRF protection unless
  // COOKIE_SAME_SITE env is set to "none" for cross-domain setups.
  const sameSiteOverride = process.env.COOKIE_SAME_SITE as "none" | "lax" | "strict" | undefined;
  const sameSite: "none" | "lax" | "strict" = sameSiteOverride ?? (isProduction ? "lax" : "none");

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure,
  };
}
