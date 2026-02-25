export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

const REQUIRED_ENV_VARS: Array<{ key: string; envName: string }> = [
  { key: "cookieSecret", envName: "JWT_SECRET" },
  { key: "databaseUrl", envName: "DATABASE_URL" },
  { key: "oAuthServerUrl", envName: "OAUTH_SERVER_URL" },
];

export function validateEnv(): void {
  const missing: string[] = [];
  for (const { key, envName } of REQUIRED_ENV_VARS) {
    if (!ENV[key as keyof typeof ENV]) {
      missing.push(envName);
    }
  }
  if (missing.length > 0) {
    const msg = `[ENV] Missing required environment variables: ${missing.join(", ")}`;
    if (ENV.isProduction) {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }

  if (ENV.isProduction && ENV.cookieSecret.length < 32) {
    throw new Error("[ENV] JWT_SECRET must be at least 32 characters in production");
  }
}
