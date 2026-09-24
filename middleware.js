// Vercel Edge Middleware: injects per-band Open Graph tags (cover photo, or
// logo as fallback) into the HTML shell for link-preview crawlers hitting a
// band page, since the app is a client-rendered SPA and crawlers don't run JS.

export const config = {
  matcher: "/((?!api|assets|icons|splash|favicon|manifest\\.json|.*\\..*).*)",
};

const BOT_UA = /bot|facebookexternalhit|whatsapp|telegram|twitterbot|slackbot|discordbot|linkedinbot|pinterest|skype|vkshare|redditbot|embedly|quora|outbrain|w3c_validator|developers\.google\.com/i;

const RESERVED_SLUGS = new Set([
  "",
  "manifesto",
  "bands",
  "shows",
  "venues",
  "partners",
  "news",
  "threads",
  "contact",
  "my-band",
  "profile",
  "admin",
  "login",
  "register",
  "forgot-password",
  "reset-password",
]);

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const ua = request.headers.get("user-agent") || "";

  if (!BOT_UA.test(ua)) {
    return fetch(request);
  }

  const segments = url.pathname.split("/").filter(Boolean);
  let slug = null;
  if (segments.length === 2 && segments[0] === "bands") {
    slug = segments[1];
  } else if (segments.length === 1 && !RESERVED_SLUGS.has(segments[0])) {
    slug = segments[0];
  }

  if (!slug) {
    return fetch(request);
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return fetch(request);
  }

  let band = null;
  try {
    const apiRes = await fetch(
      `${supabaseUrl}/rest/v1/bands?slug=eq.${encodeURIComponent(slug)}&select=name,bio,photo_url,logo_url&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    if (apiRes.ok) {
      const rows = await apiRes.json();
      band = rows && rows[0];
    }
  } catch {
    // ignore, fall through to default page
  }

  if (!band) {
    return fetch(request);
  }

  const image = band.photo_url || band.logo_url;
  const htmlRes = await fetch(new URL("/index.html", url));
  let html = await htmlRes.text();

  const title = `${band.name} | Underground 014`;
  const description = band.bio
    ? band.bio.slice(0, 200)
    : "Plataforma da cena underground local.";

  const tags = [
    `<meta property="og:type" content="profile">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(url.href)}">`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}">` : "",
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : "",
  ].filter(Boolean).join("\n    ");

  html = html.replace("</head>", `    ${tags}\n  </head>`);
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
