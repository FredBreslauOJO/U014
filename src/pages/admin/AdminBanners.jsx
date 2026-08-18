import React, { useEffect, useState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { supabase } from "@/supabase";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

const TABS = [
  { key: "pending", label: "Pendentes" },
  { key: "approved", label: "Aprovados" },
  { key: "rejected", label: "Rejeitados" },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("created_date", { ascending: false });
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (b, status) => {
    await supabase.from("banners").update({ status }).eq("id", b.id);
    setBanners((bs) => bs.map((x) => (x.id === b.id ? { ...x, status } : x)));
  };

  const handleDelete = async () => {
    await supabase.from("banners").delete().eq("id", deleting.id);
    setBanners((bs) => bs.filter((b) => b.id !== deleting.id));
    setDeleting(null);
  };

  const filtered = banners.filter((b) => b.status === tab);

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Banners</h1>

      <div className="flex items-center gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
              tab === t.key
                ? "bg-[#a8f776] text-black"
                : "bg-[#121212] border border-[#222] text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]"
            }`}
          >
            {t.label} ({banners.filter((b) => b.status === t.key).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#606060]">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#121212] border border-[#1e1e1e] rounded-xl p-12 text-center text-[#707070]">
          Nenhum banner nesta categoria.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-[#121212] border border-[#1e1e1e] rounded-xl overflow-hidden">
              {b.image_url ? (
                <img src={b.image_url} alt="" className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-[#1a1a1a]" />
              )}
              <div className="p-4">
                <div className="font-semibold text-white text-sm truncate">{b.title}</div>
                <div className="text-xs text-[#707070] truncate mt-1">
                  {b.subtitle || b.category || "—"} · por {b.author_name || "—"}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {tab !== "approved" && (
                    <button
                      onClick={() => setStatus(b, "approved")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#a8f776]/10 hover:bg-[#a8f776]/20 text-[#a8f776] text-xs font-bold py-2 rounded-md transition-colors"
                    >
                      <Check size={14} /> Aprovar
                    </button>
                  )}
                  {tab !== "rejected" && (
                    <button
                      onClick={() => setStatus(b, "rejected")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold py-2 rounded-md transition-colors"
                    >
                      <X size={14} /> Rejeitar
                    </button>
                  )}
                  <button
                    onClick={() => setDeleting(b)}
                    className="p-2 text-[#606060] hover:text-red-400 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir este banner?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
