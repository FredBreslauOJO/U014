import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminEditPage from "@/components/admin/AdminEditPage";

const INITIAL_FORM = {
  title: "",
  city: "",
  address: "",
  date: "",
  time: "",
  description: "",
  ticket_url: "",
};

export default function AdminShowEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("shows")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            title: data.title || "",
            city: data.city || "",
            address: data.address || "",
            date: data.date || "",
            time: data.time || "",
            description: data.description || "",
            ticket_url: data.ticket_url || "",
          });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      if (isNew) {
        const { data: created } = await supabase.from("shows").insert([form]).select().single();
        if (created) navigate(`/admin/shows/${created.id}`);
      } else {
        await supabase.from("shows").update(form).eq("id", id);
        navigate("/admin/shows");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("shows").delete().eq("id", id);
    navigate("/admin/shows");
  };

  if (loading) return <div className="text-center py-20 text-[#606060]">Carregando...</div>;

  return (
    <AdminEditPage
      title={isNew ? "Novo Show" : "Editar Show"}
      backTo="/admin/shows"
      onSubmit={handleSubmit}
      saving={saving}
      onDelete={isNew ? undefined : handleDelete}
      deleteLabel="Excluir este show?"
    >
      <p className="text-xs text-[#707070]">
        Line-up de bandas e casas segue editável apenas pelo dono do show em /shows.
      </p>

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
          rows={4}
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
    </AdminEditPage>
  );
}
