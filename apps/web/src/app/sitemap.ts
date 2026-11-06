import type { MetadataRoute } from "next";
import { indexable, publicRoutes, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return siteUrl && indexable
    ? publicRoutes.map((route) => ({ url: new URL(route, siteUrl).href }))
    : [];
}
