import { useMemo, useState } from "react";

export function useAdminSort(rows, initial = { key: "created_date", dir: "desc" }, overrides = {}) {
  const [sort, setSort] = useState(initial);

  const handleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const value = (row, key) => {
    if (overrides[key]) return overrides[key](row);
    const v = row[key];
    if (v == null) return v;
    if (key.toLowerCase().includes("date")) return new Date(v).getTime();
    return typeof v === "string" ? v.toLowerCase() : v;
  };

  const sorted = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = value(a, sort.key);
      const vb = value(b, sort.key);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [rows, sort, overrides]);

  return { sort, handleSort, sorted };
}

export const formatDateTime = (value) => {
  const d = new Date(value);
  const date = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${time}`;
};

export const createdDateColumn = (overrides) => ({
  key: "created_date",
  label: "Criado em",
  sortable: true,
  headClassName: "w-40",
  render: (r) => formatDateTime(r.created_date),
  ...overrides,
});
