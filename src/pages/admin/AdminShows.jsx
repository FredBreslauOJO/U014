import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarDays } from "lucide-react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { formatUrl } from "@/lib/supabaseStorage";
import { useAdminSort, createdDateColumn } from "@/lib/useAdminSort";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

export default function AdminShows() {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("shows").select("*").eq("status", "active");
    setShows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const { sort, handleSort, sorted: sortedShows } = useAdminSort(shows, { key: "date", dir: "desc" });

  const handleDelete = async () => {
    await supabase.from("shows").update({ status: "disabled" }).eq("id", deleting.id);
    setShows((ss) => ss.filter((s) => s.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    {
      key: "icon",
      label: "",
      render: (r) =>
        r.flyer_url ? (
          <img src={formatUrl(r.flyer_url)} alt="" className="w-6 h-6 rounded object-cover bg-[#1a1a1a]" />
        ) : (
          <div className="w-6 h-6 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#505050]">
            <CalendarDays size={11} />
          </div>
        ),
    },
    { key: "title", label: "Título", sortable: true },
    {
      key: "date",
      label: "Data do show",
      sortable: true,
      render: (r) => new Date(`${r.date}T00:00:00`).toLocaleDateString("pt-BR"),
    },
    { key: "city", label: "Cidade", sortable: true, render: (r) => r.city || "—" },
    createdDateColumn(),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Shows</h1>
          <p className="text-[#808080] text-sm mt-1">
            {sortedShows.length} {sortedShows.length === 1 ? "show cadastrado" : "shows cadastrados"}
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/shows/new")}
          className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold"
        >
          <Plus size={16} className="mr-1" /> Novo Show
        </Button>
      </div>

      <p className="text-xs text-[#707070] mb-4">
        Line-up de bandas e casas segue editável apenas pelo dono do show em /shows.
      </p>

      <AdminEntityTable
        columns={columns}
        rows={sortedShows}
        loading={loading}
        onEdit={(r) => navigate(`/admin/shows/${r.id}`)}
        onDelete={setDeleting}
        sort={sort}
        onSortChange={handleSort}
      />

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir este show?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
