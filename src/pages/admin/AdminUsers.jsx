import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import { useAdminSort } from "@/lib/useAdminSort";
import AdminEntityTable from "@/components/admin/AdminEntityTable";

const ROLES = ["user", "admin"];

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    setSavingId(id);
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (!error) {
      setProfiles((ps) => ps.map((p) => (p.id === id ? { ...p, role } : p)));
    }
    setSavingId(null);
  };

  const { sort, handleSort, sorted: sortedProfiles } = useAdminSort(profiles, { key: "created_at", dir: "desc" });

  const columns = [
    { key: "email", label: "Email", sortable: true },
    { key: "full_name", label: "Nome", sortable: true, render: (r) => r.full_name || "—" },
    {
      key: "created_at",
      label: "Criado em",
      sortable: true,
      headClassName: "w-40",
      render: (r) =>
        new Date(r.created_at).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "role",
      label: "Papel",
      sortable: true,
      render: (r) => (
        <select
          value={r.role}
          disabled={savingId === r.id}
          onChange={(e) => changeRole(r.id, e.target.value)}
          className="bg-[#0a0a0a] border border-[#222] text-white text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-[#a8f776] disabled:opacity-50"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Usuários</h1>
      <AdminEntityTable
        columns={columns}
        rows={sortedProfiles}
        loading={loading}
        sort={sort}
        onSortChange={handleSort}
      />
    </div>
  );
}
