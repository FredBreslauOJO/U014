import { readFileSync, existsSync } from "node:fs";

const required = [
  "src/components/SeoMeta.jsx",
  "src/pages/PublicEntityDetail.jsx",
  "middleware.js",
  "supabase/migrations/20260924213000_add_public_content_slugs.sql",
  "public/images/og-default.png",
  "public/robots.txt",
  "api/sitemap.js",
];
const missing = required.filter((path) => !existsSync(path));
const middleware = readFileSync("middleware.js", "utf8");
const app = readFileSync("src/App.jsx", "utf8");
const html = readFileSync("index.html", "utf8");
if (missing.length || !middleware.includes("og:site_name") || !middleware.includes("og:image:width") || !app.includes('path="/shows/:slug"') || !html.includes("og-default.png")) {
  console.error({ missing });
  process.exit(1);
}
console.log("SEO_CONTRACT_OK");
