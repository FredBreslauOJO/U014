import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Music2 } from "lucide-react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { formatUrl } from "@/lib/supabaseStorage";
import { useAdminSort, createdDateColumn } from "@/lib/useAdminSort";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

export default function AdminBands() {
  const navigate = useNavigate();
  const [bands, setBands] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const [{ data: bandsData }, { data: profilesData }] = await Promise.all([
      supabase.from("bands").select("*"),
      supabase.from("profiles").select("id, email, full_name"),
    ]);
    setBands(bandsData || []);
    setProfilesById(Object.fromEntries((profilesData || []).map((p) => [p.id, p])));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const ownerName = (b) => {
    const profile = profilesById[b.created_by_id];
    return profile?.full_name || profile?.email || b.email || "—";
  };

  const { sort, handleSort, sorted: sortedBands } = useAdminSort(bands, { key: "created_date", dir: "desc" }, {
    genres: (b) => (b.genres?.length ? b.genres.join(", ") : b.genre || "").toLowerCase(),
    owner: (b) => ownerName(b).toLowerCase(),
  });

  const handleDelete = async () => {
    await supabase.from("bands").delete().eq("id", deleting.id);
    setBands((bs) => bs.filter((b) => b.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    {
      key: "icon",
      label: "",
      render: (r) =>
        r.logo_url || r.photo_url ? (
          <img
            src={formatUrl(r.logo_url || r.photo_url)}
            alt=""
            className="w-6 h-6 rounded object-cover bg-[#1a1a1a]"
          />
        ) : (
          <div className="w-6 h-6 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#505050]">
            <Music2 size={11} />
          </div>
        ),
    },
    { key: "name", label: "Nome", sortable: true },
    { key: "city", label: "Cidade", sortable: true, render: (r) => r.city || "—" },
    { key: "owner", label: "Dono", sortable: true, render: (r) => ownerName(r) },
    {
      key: "genres",
      label: "Estilos",
      sortable: true,
      headClassName: "w-52",
      render: (r) => {
        const genres = r.genres?.length ? r.genres : r.genre ? [r.genre] : [];
        return genres.length ? (
          <div className="flex flex-wrap gap-1 max-w-[210px]">
            {genres.map((g) => (
              <span
                key={g}
                className="text-[9px] font-bold text-[#a8f776] uppercase tracking-wide bg-[#a8f776]/10 px-1.5 py-0.5 rounded leading-none"
              >
                {g}
              </span>
            ))}
          </div>
        ) : (
          "—"
        );
      },
    },
    createdDateColumn(),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Bandas</h1>
        <Button
          onClick={() => navigate("/admin/bands/new")}
          className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold"
        >
          <Plus size={16} className="mr-1" /> Nova Banda
        </Button>
      </div>

      <AdminEntityTable
        columns={columns}
        rows={sortedBands}
        loading={loading}
        onEdit={(r) => navigate(`/admin/bands/${r.id}`)}
        onDelete={setDeleting}
        sort={sort}
        onSortChange={handleSort}
      />

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir esta banda?"
        description="Esta ação não pode ser desfeita. A página da banda e seu mural serão removidos permanentemente."
        onConfirm={handleDelete}
      />
    </div>
  );
}
