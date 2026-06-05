import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://posture-at-work.vercel.app";
  const now = new Date();

  return [
    { url: base,                              lastModified: now, changeFrequency: "weekly",  priority: 1   },
    { url: `${base}/questionnaire`,           lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/entreprise`,              lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/entreprise/signup`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/exemple-rapport`,         lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/premium`,                 lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/mobilite`,                lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/conseils/setup`,          lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/conseils/douleurs`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/conseils/habitudes`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/conseils/sommeil`,        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/conseils/nutrition`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/conseils/lifestyle`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
