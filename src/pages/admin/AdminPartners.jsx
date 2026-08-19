import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Briefcase } from "lucide-react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { formatUrl } from "@/lib/supabaseStorage";
import { useAdminSort, createdDateColumn } from "@/lib/useAdminSort";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

export default function AdminPartners() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("partners").select("*").eq("status", "active");
    setPartners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const { sort, handleSort, sorted: sortedPartners } = useAdminSort(partners);

  const handleDelete = async () => {
    await supabase.from("partners").update({ status: "disabled" }).eq("id", deleting.id);
    setPartners((ps) => ps.filter((p) => p.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    {
      key: "icon",
      label: "",
      render: (r) =>
        r.photo_url ? (
          <img src={formatUrl(r.photo_url)} alt="" className="w-6 h-6 rounded object-cover bg-[#1a1a1a]" />
        ) : (
          <div className="w-6 h-6 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#505050]">
            <Briefcase size={11} />
          </div>
        ),
    },
    { key: "name", label: "Nome", sortable: true },
    { key: "category", label: "Categoria", sortable: true },
    { key: "city", label: "Cidade", sortable: true, render: (r) => r.city || "—" },
    createdDateColumn(),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Guia da Cena</h1>
          <p className="text-[#808080] text-sm mt-1">
            {sortedPartners.length} {sortedPartners.length === 1 ? "parceiro cadastrado" : "parceiros cadastrados"}
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/partners/new")}
          className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold"
        >
          <Plus size={16} className="mr-1" /> Novo Cadastro
        </Button>
      </div>

      <AdminEntityTable
        columns={columns}
        rows={sortedPartners}
        loading={loading}
        onEdit={(r) => navigate(`/admin/partners/${r.id}`)}
        onDelete={setDeleting}
        sort={sort}
        onSortChange={handleSort}
      />

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir este cadastro?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
