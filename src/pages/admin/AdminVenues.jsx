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
  name: "",
  address: "",
  city: "",
  capacity: "",
  contact: "",
  instagram: "",
  photo_url: "",
  description: "",
};

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("venues").select("*").order("created_date", { ascending: false });
    setVenues(data || []);
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

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      name: v.name || "",
      address: v.address || "",
      city: v.city || "",
      capacity: v.capacity || "",
      contact: v.contact || "",
      instagram: v.instagram || "",
      photo_url: v.photo_url || "",
      description: v.description || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
      if (editing) {
        await supabase.from("venues").update(payload).eq("id", editing.id);
        setVenues((vs) => vs.map((v) => (v.id === editing.id ? { ...v, ...payload } : v)));
      } else {
        const { data: created } = await supabase.from("venues").insert([payload]).select().single();
        if (created) setVenues((vs) => [created, ...vs]);
      }
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("venues").delete().eq("id", deleting.id);
    setVenues((vs) => vs.filter((v) => v.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    { key: "name", label: "Nome" },
    { key: "city", label: "Cidade", render: (r) => r.city || "—" },
    { key: "capacity", label: "Capacidade", render: (r) => r.capacity || "—" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Casas de Shows</h1>
        <Button onClick={openCreate} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
          <Plus size={16} className="mr-1" /> Nova Casa
        </Button>
      </div>

      <AdminEntityTable
        columns={columns}
        rows={venues}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <AdminFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={editing ? "Editar Casa" : "Nova Casa"}
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
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Capacidade</label>
            <Input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="bg-[#0a0a0a] border-[#222] text-white"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Endereço</label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Contato</label>
            <Input
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
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
          <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">URL da Foto</label>
          <Input
            value={form.photo_url}
            onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
            className="bg-[#0a0a0a] border-[#222] text-white"
          />
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
      </AdminFormDialog>

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir esta casa de shows?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
