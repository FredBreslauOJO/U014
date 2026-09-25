export const slugify = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export const entityPath = (type, entity) => {
  const identifier = entity?.slug || entity?.id;
  return identifier ? `/${type}/${encodeURIComponent(identifier)}` : `/${type}`;
};

export const bandUrl = (band) => entityPath("bands", band);
