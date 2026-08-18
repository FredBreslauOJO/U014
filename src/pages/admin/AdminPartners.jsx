import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

const CATEGORIES = [
  "Foto & Vídeo",
  "Som & Equipamento",
  "Estúdios & Luthieria",
  "Merch & Arte",
  "Produção & Eventos",
  "Outros Serviços",
];

const INITIAL_FORM = {
  name: "",
  category: "Foto & Vídeo",
  specialties: "",
  city: "",
  bio: "",
  whatsapp: "",
  instagram: "",
  portfolio_url: "",
  photo_url: "",
};

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("partners").select("*").order("created_date", { ascending: false });
    setPartners(data || []);
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

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      category: p.category || "Foto & Vídeo",
      specialties: p.specialties || "",
      city: p.city || "",
      bio: p.bio || "",
      whatsapp: p.whatsapp || "",
      instagram: p.instagram || "",
      portfolio_url: p.portfolio_url || "",
      photo_url: p.photo_url || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await supabase.from("partners").update(form).eq("id", editing.id);
        setPartners((ps) => ps.map((p) => (p.id === editing.id ? { ...p, ...form } : p)));
      } else {
        const { data: created } = await supabase.from("partners").insert([form]).select().single();
        if (created) setPartners((ps) => [created, ...ps]);
      }
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("partners").delete().eq("id", deleting.id);
    setPartners((ps) => ps.filter((p) => p.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    { key: "name", label: "Nome" },
    { key: "category", label: "Categoria" },
    { key: "city", label: "Cidade", render: (r) => r.city || "—" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Guia da Cena</h1>
        <Button onClick={openCreate} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
          <Plus size={16} className="mr-1" /> Novo Cadastro
        </Button>
      </div>

      <AdminEntityTable
        columns={columns}
        rows={partners}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <AdminFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={editing ? "Editar Cadastro" : "Novo Cadastro"}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Nome *</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              className="w-full bg-[#0a0a0a] border border-[#222] text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#a8f776]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Cidade</label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="bg-[#0a0a0a] border-[#222] text-white"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Especialidades</label>
          <Input
            value={form.specialties}
            onChange={(e) => setForm({ ...form, specialties: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Resumo</label>
          <Textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white text-sm"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">WhatsApp</label>
            <Input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="bg-[#0a0a0a] border-[#222] text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Instagram</label>
            <Input
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="bg-[#0a0a0a] border-[#222] text-white"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Portfólio</label>
          <Input
            value={form.portfolio_url}
            onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">URL da Foto</label>
          <Input
            value={form.photo_url}
            onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white"
          />
        </div>
      </AdminFormDialog>

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir este cadastro?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
