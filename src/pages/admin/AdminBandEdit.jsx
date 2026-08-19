import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "@/components/TagInput";
import { GENRES } from "@/lib/genres";
import AdminEditPage from "@/components/admin/AdminEditPage";
import AdminImageField from "@/components/admin/AdminImageField";

const INITIAL_FORM = {
  name: "",
  city: "",
  genres: [],
  performance_type: "ambos",
  bio: "",
  logo_url: "",
  photo_url: "",
  created_by_id: "",
};

export default function AdminBandEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [form, setForm] = useState(INITIAL_FORM);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .order("email")
      .then(({ data }) => setProfiles(data || []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("bands")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            name: data.name || "",
            city: data.city || "",
            genres: data.genres || (data.genre ? [data.genre] : []),
            performance_type: data.performance_type || "ambos",
            bio: data.bio || "",
            logo_url: data.logo_url || "",
            photo_url: data.photo_url || "",
            created_by_id: data.created_by_id || "",
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
        const { data: created } = await supabase.from("bands").insert([form]).select().single();
        if (created) navigate(`/admin/bands/${created.id}`);
      } else {
        await supabase.from("bands").update(form).eq("id", id);
        navigate("/admin/bands");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await supabase.from("bands").delete().eq("id", id);
    navigate("/admin/bands");
  };

  if (loading) return <div className="text-center py-20 text-[#606060]">Carregando...</div>;

  return (
    <AdminEditPage
      title={isNew ? "Nova Banda" : "Editar Banda"}
      backTo="/admin/bands"
      onSubmit={handleSubmit}
      saving={saving}
      onDelete={isNew ? undefined : handleDelete}
      deleteLabel="Excluir esta banda?"
      deleteDescription="Esta ação não pode ser desfeita. A página da banda e seu mural serão removidos permanentemente."
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

      <div className="grid grid-cols-2 gap-4">
        <AdminImageField
          label="Logo"
          value={form.logo_url}
          onChange={(url) => setForm({ ...form, logo_url: url })}
          folder="bands"
        />
        <AdminImageField
          label="Foto"
          value={form.photo_url}
          onChange={(url) => setForm({ ...form, photo_url: url })}
          folder="bands"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Dono</label>
        <select
          value={form.created_by_id}
          onChange={(e) => setForm({ ...form, created_by_id: e.target.value })}
          className="w-full bg-[#0a0a0a] border border-[#222] text-white text-sm rounded-md h-10 px-3 focus:outline-none focus:border-[#a8f776]"
        >
          <option value="">— Sem dono —</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name ? `${p.full_name} (${p.email})` : p.email}
            </option>
          ))}
        </select>
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
          rows={4}
        />
      </div>
    </AdminEditPage>
  );
}
