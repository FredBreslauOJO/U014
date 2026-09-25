export const config = { matcher: "/((?!api|assets|icons|splash|images|favicon|manifest\\.json|robots\\.txt|.*\\..*).*)" };

const CANONICAL_ORIGIN = "https://www.underground014.com.br";
const SITE_NAME = "Underground 014";
const DEFAULT_DESCRIPTION = "Plataforma da cena underground local. Promova seu material, encontre parcerias, divulgue shows e junte a galera.";
const RESERVED = new Set(["", "manifesto", "bands", "shows", "venues", "partners", "news", "threads", "contact", "my-band", "profile", "admin", "login", "register", "forgot-password", "reset-password"]);
const ROUTES = {
  bands: { table: "bands", name: "name", description: "bio", image: ["photo_url", "logo_url"] },
  shows: { table: "shows", name: "title", description: "description", image: ["flyer_url"] },
  venues: { table: "venues", name: "name", description: "description", image: ["photo_url"] },
  partners: { table: "partners", name: "name", description: "bio", image: ["photo_url"] },
  news: { table: "news", name: "title", description: "content", image: ["image_url"] },
  threads: { table: "threads", name: "title", description: "content", image: ["image_url"] },
};

const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const truncate = (value, length = 155) => String(value || "").replace(/\s+/g, " ").trim().slice(0, length);

function socialImage(image, origin) {
  if (!image) return `${origin}/images/og-default.png`;
  try {
    const url = new URL(image, origin);
    if (url.origin.endsWith(".supabase.co") && url.pathname.includes("/storage/v1/object/public/")) {
      url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
      url.searchParams.set("width", "1200"); url.searchParams.set("height", "630"); url.searchParams.set("resize", "cover"); url.searchParams.set("format", "origin");
    }
    return url.href;
  } catch { return `${origin}/images/og-default.png`; }
}

async function resolveEntity(url, supabaseUrl, supabaseKey) {
  const segments = url.pathname.split("/").filter(Boolean);
  let type; let key;
  if (segments.length === 2 && ROUTES[segments[0]]) [type, key] = segments;
  else if (segments.length === 1 && !RESERVED.has(segments[0])) { type = "bands"; key = segments[0]; }
  if (!type || !key) return null;
  const route = ROUTES[type];
  const apiUrl = new URL(`${supabaseUrl}/rest/v1/${route.table}`);
  apiUrl.searchParams.set("select", "*");
  apiUrl.searchParams.set("or", `(slug.eq.${key},id.eq.${key})`);
  apiUrl.searchParams.set("limit", "1");
  const response = await fetch(apiUrl, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
  if (!response.ok) return null;
  const [entity] = await response.json();
  return entity ? { type, route, entity } : null;
}

function tagsFor({ url, resolved }) {
  const origin = CANONICAL_ORIGIN;
  const entity = resolved?.entity;
  const route = resolved?.route;
  const name = entity?.[route?.name] || SITE_NAME;
  const description = truncate(entity?.[route?.description] || DEFAULT_DESCRIPTION);
  const image = socialImage(route?.image.map((field) => entity?.[field]).find(Boolean), origin);
  const canonicalPath = entity ? `/${resolved.type}/${entity.slug || entity.id}` : "/";
  const canonical = new URL(canonicalPath, origin).href;
  const title = entity ? `${SITE_NAME} | A cena underground local | ${name}` : `${SITE_NAME} | A cena underground local`;
  const values = [
    ["property", "og:type", entity ? "article" : "website"], ["property", "og:title", title], ["property", "og:description", description], ["property", "og:url", canonical], ["property", "og:site_name", SITE_NAME], ["property", "og:locale", "pt_BR"], ["property", "og:image", image], ["property", "og:image:secure_url", image], ["property", "og:image:width", "1200"], ["property", "og:image:height", "630"], ["property", "og:image:alt", name], ["name", "twitter:card", "summary_large_image"], ["name", "twitter:title", title], ["name", "twitter:description", description], ["name", "twitter:image", image], ["name", "twitter:image:alt", name],
  ].map(([attribute, key, value]) => `<meta ${attribute}="${key}" content="${escapeHtml(value)}">`).join("\n    ");
  return { title, description, canonical, values };
}

export async function createSeoMetadata(url, supabaseUrl, supabaseKey) {
  let resolved = null;
  if (supabaseUrl && supabaseKey) { try { resolved = await resolveEntity(url, supabaseUrl, supabaseKey); } catch {} }
  return tagsFor({ url, resolved });
}

export function injectSeoMetadata(html, meta) {
  const withoutSocial = html.replace(/<meta[^>]+(?:property|name)="(?:og:[^"]+|twitter:[^"]+)"[^>]*>\s*/g, "")
    .replace(/<meta name="description"[^>]*>\s*/g, "").replace(/<link rel="canonical"[^>]*>\s*/g, "");
  return withoutSocial.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace("</head>", `    <meta name="description" content="${escapeHtml(meta.description)}">\n    <link rel="canonical" href="${escapeHtml(meta.canonical)}">\n    ${meta.values}\n  </head>`);
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const meta = await createSeoMetadata(url, supabaseUrl, supabaseKey);
  const htmlResponse = await fetch(new URL("/index.html", url));
  const html = injectSeoMetadata(await htmlResponse.text(), meta);
  return new Response(html, { status: htmlResponse.status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" } });
}
