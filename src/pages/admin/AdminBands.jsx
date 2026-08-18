import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "@/components/TagInput";
import { GENRES } from "@/lib/genres";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

const INITIAL_FORM = {
  name: "",
  city: "",
  genres: [],
  performance_type: "ambos",
  bio: "",
};

export default function AdminBands() {
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("bands").select("*").order("created_date", { ascending: false });
    setBands(data || []);
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

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name || "",
      city: b.city || "",
      genres: b.genres || (b.genre ? [b.genre] : []),
      performance_type: b.performance_type || "ambos",
      bio: b.bio || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await supabase.from("bands").update(form).eq("id", editing.id);
        setBands((bs) => bs.map((b) => (b.id === editing.id ? { ...b, ...form } : b)));
      } else {
        const { data: created } = await supabase.from("bands").insert([form]).select().single();
        if (created) setBands((bs) => [created, ...bs]);
      }
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("bands").delete().eq("id", deleting.id);
    setBands((bs) => bs.filter((b) => b.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    { key: "name", label: "Nome" },
    { key: "city", label: "Cidade", render: (r) => r.city || "—" },
    { key: "genres", label: "Estilos", render: (r) => (r.genres?.length ? r.genres.join(", ") : r.genre) || "—" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Bandas</h1>
        <Button onClick={openCreate} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
          <Plus size={16} className="mr-1" /> Nova Banda
        </Button>
      </div>

      <AdminEntityTable columns={columns} rows={bands} loading={loading} onEdit={openEdit} onDelete={setDeleting} />

      <AdminFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={editing ? "Editar Banda" : "Nova Banda"}
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
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Cidade</label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="bg-[#0a0a0a] border-[#222] text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Tipo</label>
            <select
              value={form.performance_type}
              onChange={(e) => setForm({ ...form, performance_type: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#222] text-white text-sm rounded-md h-10 px-3 focus:outline-none focus:border-[#a8f776]"
            >
              <option value="ambos">Ambos</option>
              <option value="autoral">Autoral</option>
              <option value="cover">Cover</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Estilos</label>
          <TagInput plain suggestions={GENRES} value={form.genres} onChange={(v) => setForm({ ...form, genres: v })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Bio</label>
          <Textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white text-sm"
            rows={3}
          />
        </div>
      </AdminFormDialog>

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
