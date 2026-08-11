import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Music2, Upload, Save, ArrowLeft, UserPlus, Star, Pencil } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import TagInput from "@/components/TagInput";
import { GENRES } from "@/lib/genres";
import { slugify } from "@/lib/slug";
import { uploadImage } from "@/utils/upload";

const emptyForm = () => ({
  name: "", bio: "", genres: [], performance_type: "ambos", city: "",
  whatsapp: "", email: "", instagram: "", youtube: "", facebook: "", members: "",
  logo_url: "", photo_url: "", gallery: [], links: [], collaborator_emails: [],
});

export default function BandRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [myBands, setMyBands] = useState([]);
  const [editingBand, setEditingBand] = useState(null);
  const [view, setView] = useState("list");
  const [tracks, setTracks] = useState([]);
  const [newTrack, setNewTrack] = useState({ title: "", url: "", source: "youtube" });
  const [genreSuggestions, setGenreSuggestions] = useState(GENRES);
  const [form, setForm] = useState(emptyForm());

  const loadMyBands = async () => {
    if (!user) return [];
    const { data: all } = await supabase.from("bands").select("*").order("created_date", { ascending: false });
    const mine = (all || []).filter((b) => b.created_by_id === user.id || (Array.isArray(b.collaborator_emails) && b.collaborator_emails.includes(user.email)));
    setMyBands(mine);
    const used = new Set();
    (all || []).forEach((b) => (b.genres || []).forEach((g) => used.add(g)));
    setGenreSuggestions([...new Set([...GENRES, ...used])].sort((a, b) => a.localeCompare(b)));
    return mine;
  };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    (async () => {
      try { await loadMyBands(); } catch {}
      setLoading(false);
    })();
  }, [user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectBand = async (b) => {
    setEditingBand(b);
    setForm({ ...emptyForm(), ...b, gallery: b.gallery || [], links: b.links || [], genres: b.genres || (b.genre ? [b.genre] : []), collaborator_emails: b.collaborator_emails || [] });
    try {
      const { data: t } = await supabase.from("tracks").select("*").eq("band_id", b.id);
      setTracks(t || []);
    } catch { setTracks([]); }
    setView("edit");
  };

  const newBand = () => {
    setEditingBand(null);
    setForm(emptyForm());
    setTracks([]);
    setView("edit");
  };

  // Upload individual com conversão WebP
  const uploadFile = async (file, field) => {
    try {
      toast({ title: "Otimizando e enviando imagem..." });
      const fileUrl = await uploadImage(file, "bands");
      set(field, fileUrl);
      toast({ title: "Upload concluído!" });
    } catch (e) {
      toast({ title: "Erro no upload", description: e.message, variant: "destructive" });
    }
  };

  // Upload de Galeria com conversão WebP em lote
  const uploadGallery = async (files) => {
    try {
      toast({ title: "Otimizando imagens da galeria..." });
      const urls = [];
      for (const f of Array.from(files)) {
        const url = await uploadImage(f, "gallery");
        urls.push(url);
      }
      setForm((prev) => ({ ...prev, gallery: [...(prev.gallery || []), ...urls] }));
      toast({ title: `${urls.length} foto(s) adicionada(s)!` });
    } catch (e) {
      toast({ title: "Erro ao enviar fotos da galeria", variant: "destructive" });
    }
  };

  const removeGalleryImage = (i) => setForm((f) => ({ ...f, gallery: (f.gallery || []).filter((_, idx) => idx !== i) }));

  const RESERVED = ["bands", "shows", "venues", "news", "threads", "contact", "my-band", "login", "register", "forgot-password", "reset-password"];
  const generateSlug = async (name, excludeId) => {
    const base = slugify(name) || "banda";
    const { data: all } = await supabase.from("bands").select("slug, id");
    const taken = new Set([...RESERVED, ...(all || []).filter((b) => b.id !== excludeId).map((b) => b.slug).filter(Boolean)]);
    let slug = base, i = 2;
    while (taken.has(slug)) { slug = `${base}-${i++}`; }
    return slug;
  };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: "Informe o nome da banda", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, created_by_id: user.id };
      if (!editingBand) {
        payload.slug = await generateSlug(form.name);
      } else if (!editingBand.slug) {
        payload.slug = await generateSlug(form.name, editingBand.id);
      }
      
      let saved;
      if (editingBand) {
        const { data, error } = await supabase.from("bands").update(payload).eq("id", editingBand.id).select().single();
        if (error) throw error;
        saved = data;
        toast({ title: "Banda atualizada!" });
      } else {
        const { data, error } = await supabase.from("bands").insert([payload]).select().single();
        if (error) throw error;
        saved = data;
        toast({ title: "Banda cadastrada!" });
      }
      setEditingBand(saved);
      await loadMyBands();
      setView("edit");
    } catch (e) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const deleteBand = async () => {
    if (!editingBand) return;
    try {
      await supabase.from("bands").delete().eq("id", editingBand.id);
      toast({ title: "Banda excluída" });
      setEditingBand(null);
      setView("list");
      await loadMyBands();
    } catch (e) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
  };

  const addTrack = async () => {
    if (!newTrack.title.trim() || !newTrack.url.trim() || !editingBand) return;
    const { data: created, error } = await supabase.from("tracks").insert([{ ...newTrack, band_id: editingBand.id }]).select().single();
    if (!error && created) {
      setTracks([created, ...tracks]);
      setNewTrack({ title: "", url: "", source: "youtube" });
    }
  };

  const deleteTrack = async (tid) => {
    await supabase.from("tracks").delete().eq("id", tid);
    setTracks(tracks.filter((t) => t.id !== tid));
  };

  const addLink = () => setForm((f) => ({ ...f, links: [...f.links, { title: "", url: "" }] }));
  const updateLink = (i, k, v) => setForm((f) => { const links = [...f.links]; links[i] = { ...links[i], [k]: v }; return { ...f, links }; });
  const removeLink = (i) => setForm((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));

  if (loading) return <div className="flex items-center justify-center h-full text-[#606060]">Carregando...</div>;

  if (view === "list") {
    return (
      <div className="px-4 md:px-8 py-6 max-w-[900px] mx-auto">
        <h1 className="text-3xl font-black text-white mb-1">Minhas bandas</h1>
        <p className="text-[#808080] text-sm mb-6">Você pode cadastrar e gerenciar várias bandas.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={newBand} className="border-2 border-dashed border-[#2a2a2a] hover:border-[#a8f776] rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-[#707070] hover:text-[#a8f776] transition-colors min-h-[140px]">
            <Plus size={28} />
            <span className="font-medium">Cadastrar nova banda</span>
          </button>
          {myBands.map((b) => {
            const owned = b.created_by_id === user?.id;
            return (
              <button key={b.id} onClick={() => selectBand(b)} className="text-left bg-[#121212] hover:bg-[#181818] border border-[#1e1e1e] rounded-lg p-4 transition-colors flex gap-3">
                <div className="w-16 h-16 rounded-md overflow-hidden bg-[#222] shrink-0 flex items-center justify-center">
                  {b.logo_url || b.photo_url ? <img src={b.logo_url || b.photo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-[#444]">{b.name.charAt(0)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{b.name}</div>
                  <div className="text-xs text-[#808080] truncate">{(b.genres?.length ? b.genres.join(", ") : b.genre) || "—"}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-1 ${owned ? "bg-[#a8f776]/20 text-[#a8f776]" : "bg-blue-500/20 text-blue-400"}`}>
                      {owned ? <><Star size={9} /> Dono</> : <><UserPlus size={9} /> Colaborador</>}
                    </span>
                    <span className="text-[10px] text-[#606060] flex items-center gap-1 ml-auto"><Pencil size={10} /> editar</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-[900px] mx-auto">
      <button onClick={() => setView("list")} className="flex items-center gap-1 text-sm text-[#909090] hover:text-white mb-4">
        <ArrowLeft size={16} /> Minhas bandas
      </button>
      <h1 className="text-3xl font-black text-white mb-1">{editingBand ? "Editar banda" : "Cadastrar banda"}</h1>
      <p className="text-[#808080] text-sm mb-6">Gerencie a página da sua banda — bio, mídias, contatos e playlist.</p>

      <div className="space-y-6">
        <section className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#a8f776] uppercase tracking-wider">Identidade</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#b0b0b0]">Nome da banda *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="bg-[#0a0a0a] border-[#222] text-white" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-[#b0b0b0]">Estilos</Label>
              <TagInput plain suggestions={genreSuggestions} value={form.genres} onChange={(v) => set("genres", v)} placeholder="Digite o estilo e pressione Enter" />
            </div>
            <div>
              <Label className="text-[#b0b0b0]">Cidade</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="bg-[#0a0a0a] border-[#222] text-white" />
            </div>
            <div>
              <Label className="text-[#b0b0b0]">Tipo de repertório</Label>
              <select value={form.performance_type} onChange={(e) => set("performance_type", e.target.value)} className="w-full bg-[#0a0a0a] border border-[#222] text-white rounded-md h-10 px-3 text-sm">
                <option value="autoral">Autoral</option>
                <option value="cover">Cover</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-[#b0b0b0]">Bio</Label>
            <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} className="bg-[#0a0a0a] border-[#222] text-white" placeholder="Conte a história da banda..." />
          </div>
          <div>
            <Label className="text-[#b0b0b0]">Integrantes</Label>
            <Textarea value={form.members} onChange={(e) => set("members", e.target.value)} rows={3} className="bg-[#0a0a0a] border-[#222] text-white" placeholder="João (guitarra), Maria (baixo)..." />
          </div>
        </section>

        <section className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#a8f776] uppercase tracking-wider">Imagens (Conversão automática para WebP)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#b0b0b0]">Logo</Label>
              <div className="flex items-center gap-3 mt-1">
                {form.logo_url && <img src={form.logo_url} alt="" className="w-16 h-16 rounded object-cover" />}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm px-3 py-2 rounded-md"><Upload size={14} /> Enviar</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "logo_url")} />
                </label>
              </div>
            </div>
            <div>
              <Label className="text-[#b0b0b0]">Foto da banda</Label>
              <div className="flex items-center gap-3 mt-1">
                {form.photo_url && <img src={form.photo_url} alt="" className="w-16 h-16 rounded object-cover" />}
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-white text-sm px-3 py-2 rounded-md"><Upload size={14} /> Enviar</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "photo_url")} />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#a8f776] uppercase tracking-wider">Galeria de fotos</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {(form.gallery || []).map((url, i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-[#222] group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 bg-black/70 text-red-400 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-[#2a2a2a] hover:border-[#a8f776] rounded-md flex items-center justify-center cursor-pointer text-[#707070] hover:text-[#a8f776] transition-colors">
              <Upload size={20} />
              <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => { if (e.target.files?.length) uploadGallery(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
        </section>

        <section className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#a8f776] uppercase tracking-wider">Contato</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-[#b0b0b0]">WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(00) 00000-0000" className="bg-[#0a0a0a] border-[#222] text-white" /></div>
            <div><Label className="text-[#b0b0b0]">Email</Label><Input value={form.email} onChange={(e) => set("email", e.target.value)} className="bg-[#0a0a0a] border-[#222] text-white" /></div>
            <div><Label className="text-[#b0b0b0]">Instagram</Label><Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@banda" className="bg-[#0a0a0a] border-[#222] text-white" /></div>
            <div><Label className="text-[#b0b0b0]">YouTube</Label><Input value={form.youtube} onChange={(e) => set("youtube", e.target.value)} placeholder="@canal ou link" className="bg-[#0a0a0a] border-[#222] text-white" /></div>
            <div><Label className="text-[#b0b0b0]">Facebook</Label><Input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="/pagina ou link" className="bg-[#0a0a0a] border-[#222] text-white" /></div>
          </div>
        </section>

        {editingBand && (
          <section className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Music2 size={16} className="text-[#a8f776]" />
              <h2 className="text-sm font-bold text-[#a8f776] uppercase tracking-wider">Playlist da banda</h2>
            </div>
            <div className="grid sm:grid-cols-4 gap-2">
              <Input value={newTrack.title} onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })} placeholder="Título" className="bg-[#0a0a0a] border-[#222] text-white" />
              <Input value={newTrack.url} onChange={(e) => setNewTrack({ ...newTrack, url: e.target.value })} placeholder="https://..." className="bg-[#0a0a0a] border-[#222] text-white sm:col-span-2" />
              <select value={newTrack.source} onChange={(e) => setNewTrack({ ...newTrack, source: e.target.value })} className="bg-[#0a0a0a] border border-[#222] text-white rounded-md h-10 px-2 text-sm">
                <option value="youtube">YouTube</option>
                <option value="spotify">Spotify</option>
                <option value="soundcloud">SoundCloud</option>
                <option value="bandcamp">Bandcamp</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <Button onClick={addTrack} className="bg-[#a8f776] text-black hover:bg-[#8fd862]"><Plus size={14} className="mr-1" /> Adicionar faixa</Button>
            <div className="space-y-1">
              {tracks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2 bg-[#0e0e0e] rounded">
                  <Music2 size={14} className="text-[#a8f776] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{t.title}</div>
                    <div className="text-xs text-[#707070] capitalize">{t.source}</div>
                  </div>
                  <button onClick={() => deleteTrack(t.id)} className="text-[#505050] hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-3 sticky bottom-4">
          <Button onClick={save} disabled={saving} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
            <Save size={16} className="mr-1" /> {saving ? "Salvando..." : editingBand ? "Salvar alterações" : "Cadastrar banda"}
          </Button>
          <Button onClick={() => setView("list")} variant="outline" className="border-[#333] text-white">Voltar</Button>
          {editingBand && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto">
                  <Trash2 size={16} className="mr-1" /> Excluir banda
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#121212] border-[#2a2a2a] text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir esta banda?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#a0a0a0]">
                    Esta ação não pode ser desfeita. A página da banda e seu mural serão removidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#333] text-white hover:bg-[#1a1a1a]">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteBand} className="bg-red-600 text-white hover:bg-red-700">Excluir definitivamente</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}