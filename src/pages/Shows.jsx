import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, Plus, ImagePlus, X, Search, MapPin, Music2, Share2 } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import TagInput from "@/components/TagInput";
import ShowCard from "@/components/ShowCard";
import { GENRES } from "@/lib/genres";
import { getDateInLocalTimezone } from "@/lib/date";

const normalizeCity = (raw) => {
  if (!raw) return "";
  let c = raw.trim();
  c = c.replace(/[\/\-]\s*(SP|PE|RJ|MG|PR|SC|RS|BA|GO|DF|ES|MS|MT|CE|PA|AM|RN|PB|AL|SE|PI|MA|RO|AC|AP|RR|TO)$/i, "").trim();
  if (!c) return raw.trim();
  return c.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
};

export default function Shows() {
  const { toast } = useToast();
  const [shows, setShows] = useState([]);
  const [bands, setBands] = useState([]);
  const [venues, setVenues] = useState([]);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("all");

  const [searchParams] = useSearchParams();
  const highlightedShowId = searchParams.get("show") || searchParams.get("id");
  const showRefs = useRef({});
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({ 
    title: "", bands: [], venues: [], city: "", address: "", 
    date: "", time: "", description: "", ticket_url: "", flyer_url: "",
    genres: []
  });

  const load = async () => {
    const [
      { data: sData },
      { data: bData },
      { data: vData }
    ] = await Promise.all([
      supabase.from('shows').select('*').order('date', { ascending: true }),
      supabase.from('bands').select('id, name'),
      supabase.from('venues').select('id, name')
    ]);
    
    setShows(sData || []);
    setBands(bData || []);
    setVenues(vData || []);
  };

  useEffect(() => { load(); }, []);

  // Rola e expande automaticamente se a página foi aberta via link compartilhado (?show=ID)
  useEffect(() => {
    if (highlightedShowId && shows.length > 0) {
      setExpandedId(highlightedShowId);
      setTimeout(() => {
        const element = showRefs.current[highlightedShowId];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [highlightedShowId, shows]);

  const handleShare = async (title, text, url, id = null) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(url);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
      toast({
        title: "Link do evento copiado!",
        description: "Você já pode enviar no WhatsApp ou colar nas redes.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar link",
        variant: "destructive",
      });
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [uploading, setUploading] = useState(false);

  const uploadFlyer = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `flyers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('underground-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('underground-images')
        .getPublicUrl(filePath);

      set("flyer_url", data.publicUrl);
    } catch (error) {
      toast({ title: "Erro ao subir imagem", variant: "destructive" });
    } finally { 
      setUploading(false); 
    }
  };

  const resetForm = () => setForm({ 
    title: "", bands: [], venues: [], city: "", address: "", 
    date: "", time: "", description: "", ticket_url: "", flyer_url: "", genres: [] 
  });

  const openCreate = () => { setEditing(null); resetForm(); setOpen(true); };

  const openEdit = (show) => {
    setEditing(show);
    setForm({
      title: show.title || "",
      bands: show.bands || [],
      venues: show.venues || [],
      city: show.city || "",
      address: show.address || "",
      date: show.date || "",
      time: show.time || "",
      description: show.description || "",
      ticket_url: show.ticket_url || "",
      flyer_url: show.flyer_url || "",
      genres: show.genres || [],
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.date) { 
      toast({ title: "Título e data são obrigatórios", variant: "destructive" }); 
      return; 
    }
    
    const payload = {
      title: form.title,
      bands: form.bands,
      venues: form.venues,
      city: normalizeCity(form.city),
      address: form.address,
      date: form.date,
      time: form.time,
      description: form.description,
      ticket_url: form.ticket_url,
      flyer_url: form.flyer_url,
      genres: form.genres,
      created_by_id: user?.id
    };

    if (editing) {
      const { error } = await supabase.from('shows').update(payload).eq('id', editing.id);
      if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); return; }
      toast({ title: "Show atualizado com sucesso!" });
    } else {
      const { error } = await supabase.from('shows').insert([payload]);
      if (error) { toast({ title: "Erro ao salvar", variant: "destructive" }); return; }
      toast({ title: "Show divulgado com sucesso!" });
    }
    setEditing(null);
    resetForm();
    setOpen(false);
    load();
  };

  const remove = async (id) => {
    await supabase.from('shows').delete().eq('id', id);
    setShows(shows.filter((s) => s.id !== id));
  };

  const citiesList = useMemo(() => {
    const setC = new Set();
    shows.forEach((s) => {
      const c = normalizeCity(s.city);
      if (c) setC.add(c);
    });
    return Array.from(setC).sort((a, b) => a.localeCompare(b));
  }, [shows]);

  const genresList = useMemo(() => {
    const setG = new Set();
    shows.forEach((s) => {
      if (s.genres && Array.isArray(s.genres)) {
        s.genres.forEach(g => setG.add(g.trim()));
      }
      if (s.genre && typeof s.genre === "string") {
        s.genre.split(",").forEach(g => setG.add(g.trim()));
      }
    });
    return Array.from(setG).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [shows]);

  const filteredShows = useMemo(() => {
    return shows.filter((s) => {
      const showCity = normalizeCity(s.city);
      const matchCity = selectedCity === "all" || showCity.toLowerCase() === selectedCity.toLowerCase();
      
      let showGenres = [];
      if (s.genres && Array.isArray(s.genres)) showGenres.push(...s.genres.map(g => g.toLowerCase()));
      if (s.genre && typeof s.genre === "string") showGenres.push(...s.genre.split(",").map(g => g.trim().toLowerCase()));
      
      const matchGenre = selectedGenre === "all" || showGenres.includes(selectedGenre.toLowerCase());

      const q = search.toLowerCase().trim();
      const matchQuery = !q || 
        s.title?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        showCity.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        (s.bands || []).some(b => b.name?.toLowerCase().includes(q)) ||
        (s.venues || []).some(v => v.name?.toLowerCase().includes(q));

      return matchCity && matchGenre && matchQuery;
    });
  }, [shows, search, selectedCity, selectedGenre]);

  const sorted = [...filteredShows].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = sorted.filter((s) => new Date(s.date) >= new Date(Date.now() - 86400000));
  const past = sorted.filter((s) => new Date(s.date) < new Date(Date.now() - 86400000)).reverse();

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <CalendarDays className="text-[#a8f776]" /> Shows & Eventos
          </h1>
          <p className="text-[#808080] text-sm mt-1">Agenda oficial da cena underground local e região</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() =>
              handleShare(
                "Agenda de Shows - Underground 014",
                "Confira os próximos shows da cena underground!",
                `${window.location.origin}/shows`
              )
            }
            variant="outline"
            className="border-[#222] bg-[#121212] text-white hover:bg-[#1a1a1a] font-bold"
          >
            <Share2 size={16} className="mr-1.5 text-[#a8f776]" /> Compartilhar Agenda
          </Button>

          {user && (
            <Button onClick={openCreate} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
              <Plus size={16} className="mr-1" /> Divulgar show
            </Button>
          )}
        </div>

        {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
        {user && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogContent aria-describedby={undefined} className="bg-[#121212] border-[#222] text-white max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">{editing ? "Editar show" : "Divulgar show"}</DialogTitle>
                <DialogDescription className="text-xs text-[#808080]">
                  Preencha os dados do evento. Você poderá atualizar este cadastro a qualquer momento!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-[#b0b0b0]">Título do Evento *</Label>
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Manger Cadavre? em Marília" className="bg-[#0a0a0a] border-[#222] mt-1" />
                </div>
                
                <div>
                  <Label className="text-[#b0b0b0]">Estilos / Gêneros</Label>
                  <div className="mt-1">
                    <TagInput
                      suggestions={GENRES.map((g) => ({ id: g, name: g }))}
                      value={(form.genres || []).map((g) => ({ id: g, name: g }))}
                      onChange={(v) => {
                        const cleanGenres = (v || []).map(item => item.name).filter(Boolean);
                        set("genres", cleanGenres);
                      }}
                      placeholder="Ex: Hardcore, Death Metal, Punk..."
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[#b0b0b0]">Bandas participantes</Label>
                  <div className="mt-1">
                    <TagInput
                      suggestions={bands.map((b) => ({ id: b.id, name: b.name }))}
                      value={form.bands}
                      onChange={(v) => set("bands", v)}
                      placeholder="Digite e pressione Enter"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-[#b0b0b0]">Local / Casa de Shows</Label>
                  <div className="mt-1">
                    <TagInput
                      suggestions={venues.map((v) => ({ id: v.id, name: v.name }))}
                      value={form.venues}
                      onChange={(v) => set("venues", v)}
                      placeholder="Digite o local e pressione Enter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#b0b0b0]">Cidade *</Label>
                    <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Ex: Marília" className="bg-[#0a0a0a] border-[#222] mt-1" />
                  </div>
                  <div>
                    <Label className="text-[#b0b0b0]">Endereço</Label>
                    <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Rua, número" className="bg-[#0a0a0a] border-[#222] mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#b0b0b0]">Data *</Label>
                    <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="bg-[#0a0a0a] border-[#222] mt-1" />
                  </div>
                  <div>
                    <Label className="text-[#b0b0b0]">Horário</Label>
                    <Input value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="21:00" className="bg-[#0a0a0a] border-[#222] mt-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-[#b0b0b0]">Descrição / Detalhes</Label>
                  <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Escreva sobre o evento, horários dos shows..." className="bg-[#0a0a0a] border-[#222] mt-1" />
                </div>

                <div>
                  <Label className="text-[#b0b0b0]">Link de Ingressos / Evento</Label>
                  <Input value={form.ticket_url} onChange={(e) => set("ticket_url", e.target.value)} placeholder="https://..." className="bg-[#0a0a0a] border-[#222] mt-1" />
                </div>

                <div>
                  <Label className="text-[#b0b0b0]">Flyer Digital</Label>
                  <div className="mt-1">
                    {form.flyer_url ? (
                      <div className="relative w-32 h-32 rounded-md overflow-hidden border border-[#222]">
                        <img src={form.flyer_url} alt="flyer" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => set("flyer_url", "")} className="absolute top-1 right-1 bg-black/70 rounded-full p-1 hover:bg-black transition-colors">
                          <X size={14} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-[#333] rounded-md cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                        {uploading ? <span className="text-xs text-[#707070]">Enviando...</span> : (<><ImagePlus size={18} className="text-[#606060]" /><span className="text-xs text-[#606060] mt-1">Enviar imagem do cartaz</span></>)}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadFlyer(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button onClick={save} className="bg-[#a8f776] text-black hover:bg-[#8fd862] w-full font-bold">
                    {editing ? "Salvar alterações" : "Publicar Show"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* FILTROS */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por evento, banda ou cidade..." className="bg-[#121212] border-[#222] text-white pl-10" />
          </div>

          <div className="flex items-center gap-2 bg-[#121212] border border-[#222] rounded-md px-3">
            <MapPin size={16} className="text-[#a8f776] shrink-0" />
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="bg-transparent text-white text-sm h-10 outline-none cursor-pointer">
              <option value="all" className="bg-[#121212]">Todas as cidades</option>
              {citiesList.map((c) => (<option key={c} value={c} className="bg-[#121212]">{c}</option>))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#121212] border border-[#222] rounded-md px-3">
            <Music2 size={16} className="text-[#a8f776] shrink-0" />
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="bg-transparent text-white text-sm h-10 outline-none cursor-pointer">
              <option value="all" className="bg-[#121212]">Todos os estilos</option>
              {genresList.map((g) => (<option key={g} value={g} className="bg-[#121212]">{g}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* LISTA DE EVENTOS */}
      <h2 className="text-sm font-bold text-[#a8f776] uppercase tracking-wider mb-3">Próximos Shows</h2>
      <div className="space-y-3 mb-8">
        {upcoming.map((s) => (
          <div key={s.id} ref={(el) => (showRefs.current[s.id] = el)}>
            <ShowCard
              show={s}
              user={user}
              expanded={expandedId === s.id}
              onToggle={() => setExpandedId((cur) => (cur === s.id ? null : s.id))}
              onEdit={openEdit}
              onDelete={remove}
              isCopied={copiedId === s.id}
              onShare={() =>
                handleShare(
                  s.title,
                  `Show: ${s.title} - ${getDateInLocalTimezone(s.date).toLocaleDateString("pt-BR")}`,
                  `${window.location.origin}/shows?show=${s.id}`,
                  s.id
                )
              }
            />
          </div>
        ))}
        {upcoming.length === 0 && <p className="text-[#606060] text-sm py-4">Nenhum evento agendado com os filtros atuais.</p>}
      </div>

      {past.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-[#505050] uppercase tracking-wider mb-3">Shows Realizados</h2>
          <div className="space-y-3">
            {past.map((s) => (
              <div key={s.id} ref={(el) => (showRefs.current[s.id] = el)}>
                <ShowCard
                  show={s}
                  user={user}
                  expanded={expandedId === s.id}
                  onToggle={() => setExpandedId((cur) => (cur === s.id ? null : s.id))}
                  onEdit={openEdit}
                  onDelete={remove}
                  isCopied={copiedId === s.id}
                  onShare={() =>
                    handleShare(
                      s.title,
                      `Show: ${s.title} - ${getDateInLocalTimezone(s.date).toLocaleDateString("pt-BR")}`,
                      `${window.location.origin}/shows?show=${s.id}`,
                      s.id
                    )
                  }
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
