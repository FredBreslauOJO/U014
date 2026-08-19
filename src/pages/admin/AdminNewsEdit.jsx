import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminEditPage from "@/components/admin/AdminEditPage";
import AdminImageField from "@/components/admin/AdminImageField";

const CATEGORIES = ["geral", "lançamento", "show", "entrevista", "cena"];

const INITIAL_FORM = {
  title: "",
  content: "",
  image_url: "",
  author_name: "",
  category: "geral",
  external_link: "",
};

export default function AdminNewsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            title: data.title || "",
            content: data.content || "",
            image_url: data.image_url || "",
            author_name: data.author_name || "",
            category: data.category || "geral",
            external_link: data.external_link || "",
          });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const { data: created } = await supabase.from("news").insert([form]).select().single();
        if (created) navigate(`/admin/news/${created.id}`);
      } else {
        await supabase.from("news").update(form).eq("id", id);
        navigate("/admin/news");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("news").delete().eq("id", id);
    navigate("/admin/news");
  };

  if (loading) return <div className="text-center py-20 text-[#606060]">Carregando...</div>;

  return (
    <AdminEditPage
      title={isNew ? "Nova Notícia" : "Editar Notícia"}
      backTo="/admin/news"
      onSubmit={handleSubmit}
      saving={saving}
      onDelete={isNew ? undefined : handleDelete}
      deleteLabel="Excluir esta notícia?"
    >
      <div>
        <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Título *</label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-[#0a0a0a] border-[#222] text-white"
          required
        />
      </div>

      <AdminImageField
        label="Imagem"
        value={form.image_url}
        onChange={(url) => setForm({ ...form, image_url: url })}
        folder="news"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-[#222] text-white text-sm rounded-md h-10 px-3 focus:outline-none focus:border-[#a8f776]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Autor</label>
          <Input
            value={form.author_name}
            onChange={(e) => setForm({ ...form, author_name: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Conteúdo *</label>
        <Textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="bg-[#0a0a0a] border-[#222] text-white text-sm"
          rows={6}
          required
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Link externo</label>
        <Input
          value={form.external_link}
          onChange={(e) => setForm({ ...form, external_link: e.target.value })}
          className="bg-[#0a0a0a] border-[#222] text-white"
        />
      </div>
    </AdminEditPage>
  );
}
