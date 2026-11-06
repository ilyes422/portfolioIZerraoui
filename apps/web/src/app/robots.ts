import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (indexable && siteUrl) {
    return {
      rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/recherche"] },
      sitemap: new URL("/sitemap.xml", siteUrl).href,
    };
  }
  return { rules: { userAgent: "*", disallow: "/" } };
}
