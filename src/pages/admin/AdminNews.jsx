import React, { useEffect, useRef, useState } from "react";
import { Plus, ImagePlus } from "lucide-react";
import { supabase } from "@/supabase";
import { uploadImage } from "@/utils/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

const CATEGORIES = ["geral", "lançamento", "show", "entrevista", "cena"];

const INITIAL_FORM = {
  title: "",
  content: "",
  image_url: "",
  author_name: "",
  category: "geral",
  external_link: "",
};

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_date", { ascending: false });
    setNews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(INITIAL_FORM);
    setIsOpen(true);
  };

  const openEdit = (n) => {
    setEditing(n);
    setForm({
      title: n.title || "",
      content: n.content || "",
      image_url: n.image_url || "",
      author_name: n.author_name || "",
      category: n.category || "geral",
      external_link: n.external_link || "",
    });
    setIsOpen(true);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "news");
      setForm((f) => ({ ...f, image_url: url }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await supabase.from("news").update(form).eq("id", editing.id);
        setNews((ns) => ns.map((n) => (n.id === editing.id ? { ...n, ...form } : n)));
      } else {
        const { data: created } = await supabase.from("news").insert([form]).select().single();
        if (created) setNews((ns) => [created, ...ns]);
      }
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("news").delete().eq("id", deleting.id);
    setNews((ns) => ns.filter((n) => n.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    { key: "title", label: "Título" },
    { key: "category", label: "Categoria" },
    {
      key: "created_date",
      label: "Data",
      render: (r) => new Date(r.created_date).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Notícias</h1>
        <Button onClick={openCreate} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
          <Plus size={16} className="mr-1" /> Nova Notícia
        </Button>
      </div>

      <AdminEntityTable columns={columns} rows={news} loading={loading} onEdit={openEdit} onDelete={setDeleting} />

      <AdminFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={editing ? "Editar Notícia" : "Nova Notícia"}
        onSubmit={handleSubmit}
        submitting={submitting}
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
            rows={5}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Imagem</label>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
          <div className="flex items-center gap-3">
            {form.image_url && (
              <img src={form.image_url} alt="" className="w-14 h-14 rounded object-cover border border-[#222]" />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-[#333] text-white hover:bg-[#1a1a1a]"
            >
              <ImagePlus size={14} className="mr-1.5" /> {uploading ? "Enviando..." : "Enviar imagem"}
            </Button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Link externo</label>
          <Input
            value={form.external_link}
            onChange={(e) => setForm({ ...form, external_link: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white"
          />
        </div>
      </AdminFormDialog>

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir esta notícia?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
