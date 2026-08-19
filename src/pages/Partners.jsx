import React, { useState, useEffect } from "react";
import { Search, Briefcase, Plus, Phone, Instagram, ExternalLink, Edit2, Trash2, X } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useIsAdmin } from "@/lib/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  "Todos",
  "Foto & Vídeo",
  "Som & Equipamento",
  "Estúdios & Luthieria",
  "Merch & Arte",
  "Produção & Eventos",
  "Outros Serviços",
];

// Inicialização 100% limpa dos campos
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

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  const loadPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_date', { ascending: false });
      if (!error && data) setPartners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setForm(INITIAL_FORM);
    setIsOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPartner(p);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Certeza que deseja excluir este cadastro?")) return;
    try {
      await supabase.from('partners').update({ status: 'disabled' }).eq('id', id);
      setPartners(partners.filter((p) => p.id !== id));
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Preencha o nome do profissional ou serviço.");

    setSubmitting(true);
    try {
      if (editingPartner) {
        await supabase.from('partners').update(form).eq('id', editingPartner.id);
        setPartners(partners.map((p) => (p.id === editingPartner.id ? { ...p, ...form } : p)));
      } else {
        const { data: created, error } = await supabase.from('partners').insert([{
          ...form,
          created_by_id: user?.id,
        }]).select().single();
        if (error) throw error;
        setPartners([created, ...partners]);
      }
      setIsOpen(false);
      setForm(INITIAL_FORM);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar cadastro.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = partners.filter((p) => {
    const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      p.name?.toLowerCase().includes(term) ||
      p.specialties?.toLowerCase().includes(term) ||
      p.city?.toLowerCase().includes(term) ||
      p.bio?.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Briefcase className="text-[#a8f776]" size={32} /> Guia da Cena
          </h1>
          <p className="text-[#808080] text-sm mt-1">
            Encontre e divulgue profissionais, serviços e parcerias do underground.
          </p>
        </div>
        {user && (
          <Button onClick={handleOpenCreate} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
            <Plus size={18} className="mr-1" /> Cadastrar Serviço
          </Button>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#606060]" size={18} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, especialidade ou cidade..."
            className="bg-[#121212] border-[#222] text-white pl-11 h-11 focus:border-[#a8f776]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#a8f776] text-black"
                  : "bg-[#121212] border border-[#222] text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#606060]">Carregando profissionais...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#121212] border border-[#1e1e1e] rounded-xl p-12 text-center text-[#707070]">
          Nenhum profissional ou serviço encontrado com os filtros atuais.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const isOwner = user && (p.created_by_id === user.id || isAdmin);

            return (
              <div
                key={p.id}
                className="bg-[#121212] border border-[#1e1e1e] rounded-xl p-5 flex flex-col justify-between hover:border-[#2a2a2a] transition-all relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#222] shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#a8f776] font-black text-lg shrink-0">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base truncate">{p.name}</h3>
                        <span className="inline-block text-[10px] font-bold text-[#a8f776] uppercase tracking-wider bg-[#a8f776]/10 px-2 py-0.5 rounded mt-0.5">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-1 shrink-0 bg-[#0a0a0a] border border-[#222] p-1 rounded-md">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-[#a0a0a0] hover:text-[#a8f776] transition-colors"
                          title="Editar serviço"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-[#a0a0a0] hover:text-red-400 transition-colors"
                          title="Excluir serviço"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {p.specialties && (
                    <div className="bg-[#181818] border border-[#222] rounded-md px-3 py-1.5 text-xs text-[#d0d0d0] font-medium mb-3">
                      🎯 {p.specialties}
                    </div>
                  )}

                  {p.city && (
                    <div className="text-xs text-[#808080] mb-2 flex items-center gap-1">
                      📍 {p.city}
                    </div>
                  )}

                  {p.bio && (
                    <p className="text-xs text-[#a0a0a0] leading-relaxed whitespace-pre-wrap line-clamp-3 mb-4">
                      {p.bio}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#1a1a1a] flex-wrap">
                  {p.whatsapp && (
                    <a
                      href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 bg-[#a8f776] text-black hover:bg-[#8fd862] rounded-md px-3 py-2 text-xs font-bold transition-colors"
                    >
                      <Phone size={13} /> WhatsApp
                    </a>
                  )}
                  {p.instagram && (
                    <a
                      href={`https://instagram.com/${p.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#222] rounded-md px-3 py-2 text-xs font-medium transition-colors"
                    >
                      <Instagram size={13} className="text-[#a8f776]" /> Instagram
                    </a>
                  )}
                  {p.portfolio_url && (
                    <a
                      href={p.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#222] rounded-md px-3 py-2 text-xs font-medium transition-colors"
                    >
                      <ExternalLink size={13} className="text-[#a8f776]" /> Portfólio
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#222] rounded-xl w-full max-w-lg p-6 relative my-8">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#707070] hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              {editingPartner ? "Editar Cadastro" : "Cadastrar no Guia da Cena"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">
                  Nome do Profissional / Estúdio / Serviço *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome do serviço"
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
                    {CATEGORIES.filter((c) => c !== "Todos").map((c) => (
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
                    placeholder="Cidade"
                    className="bg-[#0a0a0a] border-[#222] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Especialidades / Foco</label>
                <Input
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                  placeholder="Fotografia, Retratos, Áudio..."
                  className="bg-[#0a0a0a] border-[#222] text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Resumo / Descrição</label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Descreva a experiência ou serviço prestado..."
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
                    placeholder="(00) 00000-0000"
                    className="bg-[#0a0a0a] border-[#222] text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Instagram</label>
                  <Input
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    placeholder="@seuinstagram"
                    className="bg-[#0a0a0a] border-[#222] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">Link de Portfólio / Site</label>
                <Input
                  value={form.portfolio_url}
                  onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-[#0a0a0a] border-[#222] text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">URL da Foto / Logo</label>
                <Input
                  value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-[#0a0a0a] border-[#222] text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#222]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-[#333] text-white hover:bg-[#1a1a1a]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold"
                >
                  {submitting ? "Salvando..." : editingPartner ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}