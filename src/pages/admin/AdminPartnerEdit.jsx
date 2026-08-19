import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminEditPage from "@/components/admin/AdminEditPage";
import AdminImageField from "@/components/admin/AdminImageField";

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

export default function AdminPartnerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("partners")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            name: data.name || "",
            category: data.category || "Foto & Vídeo",
            specialties: data.specialties || "",
            city: data.city || "",
            bio: data.bio || "",
            whatsapp: data.whatsapp || "",
            instagram: data.instagram || "",
            portfolio_url: data.portfolio_url || "",
            photo_url: data.photo_url || "",
          });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const { data: created } = await supabase.from("partners").insert([form]).select().single();
        if (created) navigate(`/admin/partners/${created.id}`);
      } else {
        await supabase.from("partners").update(form).eq("id", id);
        navigate("/admin/partners");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("partners").delete().eq("id", id);
    navigate("/admin/partners");
  };

  if (loading) return <div className="text-center py-20 text-[#606060]">Carregando...</div>;

  return (
    <AdminEditPage
      title={isNew ? "Novo Cadastro" : "Editar Cadastro"}
      backTo="/admin/partners"
      onSubmit={handleSubmit}
      saving={saving}
      onDelete={isNew ? undefined : handleDelete}
      deleteLabel="Excluir este cadastro?"
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
        folder="partners"
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
          rows={4}
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
    </AdminEditPage>
  );
}
