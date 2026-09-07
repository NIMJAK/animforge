import type {
  MetadataRoute,
} from "next";

export default function sitemap():
  MetadataRoute.Sitemap {
  const base =
    "https://animforge.vercel.app";

  return [
    {
      url: base,
      changeFrequency:
        "weekly",
      priority: 1,
    },

    {
      url:
        `${base}/discover`,
      changeFrequency:
        "daily",
      priority: 0.9,
    },

    {
      url:
        `${base}/about`,
      changeFrequency:
        "monthly",
      priority: 0.7,
    },

    {
      url:
        `${base}/auth/sign-up`,
      changeFrequency:
        "monthly",
      priority: 0.6,
    },

    {
      url:
        `${base}/privacy`,
      changeFrequency:
        "monthly",
      priority: 0.3,
    },

    {
      url:
        `${base}/terms`,
      changeFrequency:
        "monthly",
      priority: 0.3,
    },
  ];
}
