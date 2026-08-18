import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminFormDialog from "@/components/admin/AdminFormDialog";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

const INITIAL_FORM = {
  title: "",
  city: "",
  address: "",
  date: "",
  time: "",
  description: "",
  ticket_url: "",
};

export default function AdminShows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("shows").select("*").order("date", { ascending: false });
    setShows(data || []);
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

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      title: s.title || "",
      city: s.city || "",
      address: s.address || "",
      date: s.date || "",
      time: s.time || "",
      description: s.description || "",
      ticket_url: s.ticket_url || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.date) return;
    setSubmitting(true);
    try {
      if (editing) {
        await supabase.from("shows").update(form).eq("id", editing.id);
        setShows((ss) => ss.map((s) => (s.id === editing.id ? { ...s, ...form } : s)));
      } else {
        const { data: created } = await supabase.from("shows").insert([form]).select().single();
        if (created) setShows((ss) => [created, ...ss]);
      }
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("shows").delete().eq("id", deleting.id);
    setShows((ss) => ss.filter((s) => s.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    { key: "title", label: "Título" },
    { key: "date", label: "Data", render: (r) => new Date(`${r.date}T00:00:00`).toLocaleDateString("pt-BR") },
    { key: "city", label: "Cidade", render: (r) => r.city || "—" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Shows</h1>
        <Button onClick={openCreate} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
          <Plus size={16} className="mr-1" /> Novo Show
        </Button>
      </div>

      <p className="text-xs text-[#707070] mb-4">
        Line-up de bandas e casas segue editável apenas pelo dono do show em /shows.
      </p>

      <AdminEntityTable columns={columns} rows={shows} loading={loading} onEdit={openEdit} onDelete={setDeleting} />

      <AdminFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={editing ? "Editar Show" : "Novo Show"}
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
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Data *</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="bg-[#0a0a0a] border-[#222] text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Horário</label>
            <Input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="bg-[#0a0a0a] border-[#222] text-white"
            />
          </div>
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
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Endereço</label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="bg-[#0a0a0a] border-[#222] text-white"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Descrição</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white text-sm"
            rows={3}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Link de ingressos</label>
          <Input
            value={form.ticket_url}
            onChange={(e) => setForm({ ...form, ticket_url: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white"
          />
        </div>
      </AdminFormDialog>

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir este show?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
