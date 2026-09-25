import { useEffect } from "react";

const SITE_NAME = "Underground 014";
const ORIGIN = "https://www.underground014.com.br";
const FALLBACK_IMAGE = `${ORIGIN}/images/og-default.png`;

function upsert(selector, attributes) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
}

export default function SeoMeta({ title = SITE_NAME, description, path = "/", image, imageAlt, noIndex = false }) {
  useEffect(() => {
    const canonicalUrl = new URL(path, ORIGIN).href;
    const socialImage = image || FALLBACK_IMAGE;
    document.title = title;
    upsert('meta[name="description"]', { name: "description", content: description || "Plataforma da cena underground local." });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    upsert('meta[name="robots"]', { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow" });
    const tags = {
      "og:type": "website", "og:title": title, "og:description": description || "Plataforma da cena underground local.",
      "og:url": canonicalUrl, "og:site_name": SITE_NAME, "og:locale": "pt_BR", "og:image": socialImage,
      "og:image:secure_url": socialImage, "og:image:width": "1200", "og:image:height": "630",
      "og:image:alt": imageAlt || title,
    };
    Object.entries(tags).forEach(([property, content]) => upsert(`meta[property="${property}"]`, { property, content }));
    upsert('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsert('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsert('meta[name="twitter:description"]', { name: "twitter:description", content: tags["og:description"] });
    upsert('meta[name="twitter:image"]', { name: "twitter:image", content: socialImage });
    upsert('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: tags["og:image:alt"] });
  }, [title, description, path, image, imageAlt, noIndex]);
  return null;
}
