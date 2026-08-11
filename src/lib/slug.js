export function slugify(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function bandUrl(b) {
  if (!b) return "#";
  return b.slug ? `/${b.slug}` : `/bands/${b.id}`;
}