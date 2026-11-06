const configuredUrl = process.env.SITE_URL;
export const siteUrl = configuredUrl ? new URL(configuredUrl) : undefined;
export const indexable = Boolean(
  siteUrl &&
    process.env.ALLOW_INDEXING === "true" &&
    process.env.VERCEL_ENV !== "preview",
);

export const publicRoutes = [
  "/",
  "/cv",
  "/parcours",
  "/projets",
  "/jouer",
  "/resultats",
  "/contact",
  "/assistant",
] as const;
