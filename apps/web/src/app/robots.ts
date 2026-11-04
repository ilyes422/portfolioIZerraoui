import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Activate indexing only after the public content and production URL are verified.
  return { rules: { userAgent: "*", disallow: "/" } };
}
