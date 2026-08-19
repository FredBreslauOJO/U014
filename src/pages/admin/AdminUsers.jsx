import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import { useAdminSort, formatDateTime } from "@/lib/useAdminSort";
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
      render: (r) => formatDateTime(r.created_at),
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
      <h1 className="text-2xl font-black text-white">Usuários</h1>
      <p className="text-[#808080] text-sm mt-1 mb-6">
        {loading ? "Carregando..." : `${sortedProfiles.length} ${sortedProfiles.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}`}
      </p>
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
