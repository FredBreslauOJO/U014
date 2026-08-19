import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Newspaper } from "lucide-react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { formatUrl } from "@/lib/supabaseStorage";
import { useAdminSort, createdDateColumn } from "@/lib/useAdminSort";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

export default function AdminNews() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").eq("status", "active");
    setNews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const { sort, handleSort, sorted: sortedNews } = useAdminSort(news);

  const handleDelete = async () => {
    await supabase.from("news").update({ status: "disabled" }).eq("id", deleting.id);
    setNews((ns) => ns.filter((n) => n.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    {
      key: "icon",
      label: "",
      render: (r) =>
        r.image_url ? (
          <img src={formatUrl(r.image_url)} alt="" className="w-6 h-6 rounded object-cover bg-[#1a1a1a]" />
        ) : (
          <div className="w-6 h-6 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#505050]">
            <Newspaper size={11} />
          </div>
        ),
    },
    { key: "title", label: "Título", sortable: true },
    { key: "category", label: "Categoria", sortable: true },
    createdDateColumn(),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Notícias</h1>
          <p className="text-[#808080] text-sm mt-1">
            {sortedNews.length} {sortedNews.length === 1 ? "notícia cadastrada" : "notícias cadastradas"}
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/news/new")}
          className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold"
        >
          <Plus size={16} className="mr-1" /> Nova Notícia
        </Button>
      </div>

      <AdminEntityTable
        columns={columns}
        rows={sortedNews}
        loading={loading}
        onEdit={(r) => navigate(`/admin/news/${r.id}`)}
        onDelete={setDeleting}
        sort={sort}
        onSortChange={handleSort}
      />

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir esta notícia?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
