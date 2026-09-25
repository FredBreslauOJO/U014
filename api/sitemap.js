const ORIGIN = "https://www.underground014.com.br";
const ENTITIES = ["bands", "shows", "venues", "partners", "news", "threads"];

const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);

export default async function handler(_request, response) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const paths = ["/", "/manifesto", "/bands", "/shows", "/venues", "/partners", "/news", "/threads", "/contact"];
  if (supabaseUrl && supabaseKey) {
    const records = await Promise.all(ENTITIES.map(async (type) => {
      const select = type === "threads" ? "id,slug,parent_id" : "id,slug";
      const result = await fetch(`${supabaseUrl}/rest/v1/${type}?select=${select}`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } });
      return result.ok ? (await result.json()).filter((item) => type !== "threads" || !item.parent_id).map((item) => `/${type}/${item.slug || item.id}`) : [];
    }));
    paths.push(...records.flat());
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(paths)].map((path) => `  <url><loc>${escapeXml(new URL(path, ORIGIN).href)}</loc></url>`).join("\n")}\n</urlset>`;
  response.setHeader("content-type", "application/xml; charset=utf-8");
  response.setHeader("cache-control", "public, s-maxage=3600, stale-while-revalidate=86400");
  response.status(200).send(body);
}
