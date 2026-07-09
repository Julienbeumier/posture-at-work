import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/analyzing", "/rapport-pdf"],
    },
    sitemap: "https://postureatwork.com/sitemap.xml",
  };
}
