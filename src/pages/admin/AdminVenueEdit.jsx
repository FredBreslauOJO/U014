import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminEditPage from "@/components/admin/AdminEditPage";
import AdminImageField from "@/components/admin/AdminImageField";

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

export default function AdminVenueEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("venues")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            name: data.name || "",
            address: data.address || "",
            city: data.city || "",
            capacity: data.capacity || "",
            contact: data.contact || "",
            instagram: data.instagram || "",
            photo_url: data.photo_url || "",
            description: data.description || "",
          });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
      if (isNew) {
        const { data: created } = await supabase.from("venues").insert([payload]).select().single();
        if (created) navigate(`/admin/venues/${created.id}`);
      } else {
        await supabase.from("venues").update(payload).eq("id", id);
        navigate("/admin/venues");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("venues").delete().eq("id", id);
    navigate("/admin/venues");
  };

  if (loading) return <div className="text-center py-20 text-[#606060]">Carregando...</div>;

  return (
    <AdminEditPage
      title={isNew ? "Nova Casa" : "Editar Casa"}
      backTo="/admin/venues"
      onSubmit={handleSubmit}
      saving={saving}
      onDelete={isNew ? undefined : handleDelete}
      deleteLabel="Excluir esta casa de shows?"
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

      <AdminImageField
        label="Foto"
        value={form.photo_url}
        onChange={(url) => setForm({ ...form, photo_url: url })}
        folder="venues"
      />

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
        <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Descrição</label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-[#0a0a0a] border-[#222] text-white text-sm"
          rows={4}
        />
      </div>
    </AdminEditPage>
  );
}
