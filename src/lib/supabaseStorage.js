export const getSupabaseStorageOrigin = () => new URL(import.meta.env.VITE_SUPABASE_URL).origin;

export const formatUrl = (url) => {
  if (!url) return "";
  const storageOrigin = getSupabaseStorageOrigin();
  const cleaned = String(url).trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    return `${storageOrigin}/storage/v1/object/public/underground-images/${cleaned}`;
  }
  try {
    const parsed = new URL(cleaned);
    const isLocalStorage = /^(localhost|127\.0\.0\.1)$/.test(new URL(storageOrigin).hostname);
    if (!isLocalStorage && parsed.hostname.endsWith(".supabase.co") && parsed.origin !== storageOrigin) {
      return new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, storageOrigin).href;
    }
    return parsed.href;
  } catch {
    return cleaned;
  }
};

export const getSocialImageUrl = (url) => {
  const absolute = formatUrl(url);
  if (!absolute) return "";
  const storageOrigin = getSupabaseStorageOrigin();
  try {
    const parsed = new URL(absolute);
    if (parsed.origin !== storageOrigin || !parsed.pathname.includes("/storage/v1/object/public/")) return parsed.href;
    parsed.pathname = parsed.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
    parsed.searchParams.set("width", "1200");
    parsed.searchParams.set("height", "630");
    parsed.searchParams.set("resize", "cover");
    parsed.searchParams.set("format", "origin");
    return parsed.href;
  } catch {
    return absolute;
  }
};
