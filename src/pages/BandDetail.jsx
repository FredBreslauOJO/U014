import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, ExternalLink, CalendarDays, MapPin, MessageSquare, Trash2, Users, Instagram, Mail, Phone, Music2, Youtube, Facebook, Image as ImageIcon, X, ChevronLeft, ChevronRight, FileDown, Share2, Check } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { usePlayer } from "@/lib/playerContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generatePressKitPDF } from "@/utils/generatePressKitPDF";
import { useToast } from "@/components/ui/use-toast";

export default function BandDetail() {
  const { id, slug } = useParams();
  const targetParam = slug || id;

  const navigate = useNavigate();
  const { toast } = useToast();
  const { playTrackList } = usePlayer();
  const [band, setBand] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [shows, setShows] = useState([]);
  const [notes, setNotes] = useState([]);
  const { user } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [copied, setCopied] = useState(false);

  const formatUrl = (url) => {
    if (!url) return "";
    let cleaned = String(url).replace("https://tgxzkvhqzyxjt.supabase.co", "https://otbjufhtgxzkvhqzyxjt.supabase.co");
    if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
      return `https://otbjufhtgxzkvhqzyxjt.supabase.co/storage/v1/object/public/underground-images/${cleaned}`;
    }
    return cleaned;
  };

  const isExternalSource = (t) => {
    const url = t.url?.toLowerCase() || "";
    const source = t.source?.toLowerCase() || "";
    return (
      source === "spotify" || url.includes("spotify.com") ||
      source === "bandcamp" || url.includes("bandcamp.com")
    );
  };

  const loadAll = async () => {
    if (!targetParam) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let b = null;

    try {
      const { data: bySlug } = await supabase
        .from("bands")
        .select("*")
        .or(`slug.eq.${targetParam},id.eq.${targetParam}`)
        .maybeSingle();

      b = bySlug;
    } catch {}

    if (!b) { setLoading(false); return; }

    setBand(b);
    const bandId = b.id;

    const [tRes, sRes, nRes] = await Promise.all([
      supabase.from("tracks").select("*").or(`band_id.eq.${bandId},band_id.eq.${b.slug}`),
      supabase.from("shows").select("*").order("date", { ascending: false }),
      supabase.from("notes").select("*").eq("band_id", bandId).order("created_date", { ascending: false }),
    ]);

    setTracks(tRes.data || []);
    const allShows = sRes.data || [];
    setShows(allShows.filter((s) => (s.bands || []).some((x) => x.id === bandId) || s.band_id === bandId));
    setNotes(nRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [id, slug]);

  const handleDownloadPDF = async () => {
    if (!band) return;
    setGeneratingPDF(true);
    await generatePressKitPDF(band, tracks);
    setGeneratingPDF(false);
  };

  const handleShareBand = async () => {
    const bandUrl = `${window.location.origin}/${band.slug || band.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${band.name} - Underground 014`,
          text: `Confira a página oficial da banda ${band.name}!`,
          url: bandUrl,
        });
        return;
      } catch (e) {}
    }
    await navigator.clipboard.writeText(bandUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link do perfil copiado!" });
  };

  // Validação estendida de Dono da Banda (ID do Criador, E-mail Principal ou Colaboradores)
  const isOwner =
    user &&
    band &&
    (band.created_by_id === user.id ||
      band.email?.toLowerCase() === user.email?.toLowerCase() ||
      (Array.isArray(band.collaborator_emails) &&
        band.collaborator_emails.map((e) => e?.toLowerCase()).includes(user.email?.toLowerCase())));

  const gallery = band?.gallery || [];
  const videos = band?.videos || [];

  const renderWithLinks = (text) => {
    if (!text) return text;
    return String(text).split(/(https?:\/\/[^\s]+)/g).map((p, i) =>
      /^https?:\/\//.test(p)
        ? <a key={i} href={p} target="_blank" rel="noreferrer" className="text-[#a8f776] underline break-all">{p}</a>
        : <span key={i}>{p}</span>
    );
  };

  const playAll = () => {
    const playable = tracks
      .filter((t) => !isExternalSource(t))
      .map((t) => ({
        title: t.title,
        url: t.url,
        band_name: band.name,
        band_logo: formatUrl(band.logo_url || band.photo_url),
      }));
    if (playable.length) playTrackList(playable);
  };

  const addNote = async () => {
    if (!newNote.trim() || !user || !band) return;
    const { data: created, error } = await supabase.from("notes").insert([{
      content: newNote.trim(),
      band_id: band.id,
      author_name: user.user_metadata?.full_name || user.email,
      created_by_id: user.id
    }]).select().single();

    if (!error && created) {
      setNotes([created, ...notes]);
      setNewNote("");
    }
  };

  const deleteNote = async (noteId) => {
    await supabase.from("notes").delete().eq("id", noteId);
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  if (loading) return <div className="flex items-center justify-center h-full text-[#606060]">Carregando...</div>;
  if (!band) return <div className="flex items-center justify-center h-full text-[#606060]">Banda não encontrada.</div>;

  const playableTracks = tracks.filter((t) => !isExternalSource(t));

  return (
    <div className="pb-10">
      <div className="relative h-[320px] md:h-[480px] lg:h-[520px] overflow-hidden">
        <div className="absolute inset-0">
          {band.photo_url ? (
            <img src={formatUrl(band.photo_url)} alt="" className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        </div>
        <div className="relative h-full flex items-end px-4 md:px-8 pb-8 max-w-[1200px] mx-auto">
          <div className="flex items-end gap-5 flex-1 flex-wrap">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-lg overflow-hidden bg-[#222] border-2 border-[#1a1a1a] shadow-2xl shrink-0">
              {band.logo_url || band.photo_url ? (
                <img src={formatUrl(band.logo_url || band.photo_url)} alt={band.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-[#555]">{band.name.charAt(0)}</div>
              )}
            </div>
            <div className="pb-2 flex-1 min-w-0">
              <div className="text-xs text-[#a8f776] font-bold uppercase tracking-widest mb-1">Banda</div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{band.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-[#b0b0b0] flex-wrap">
                {band.city && <span className="flex items-center gap-1"><MapPin size={13} /> {band.city}</span>}
                {(band.genres?.length ? band.genres.join(", ") : band.genre) && <span>• {band.genres?.length ? band.genres.join(", ") : band.genre}</span>}
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                  band.performance_type === "autoral" ? "bg-[#a8f776]/20 text-[#a8f776]" :
                  band.performance_type === "cover" ? "bg-blue-500/20 text-blue-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>{band.performance_type}</span>
              </div>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <Button onClick={playAll} disabled={!playableTracks.length} className="bg-white text-black hover:bg-[#e0e0e0] font-bold">
                  <Play size={16} className="mr-1" fill="currentColor" /> Reproduzir
                </Button>

                <Button
                  onClick={handleDownloadPDF}
                  disabled={generatingPDF}
                  className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold"
                >
                  <FileDown size={16} className="mr-1.5" />
                  {generatingPDF ? "Gerando..." : "PRESS KIT (PDF)"}
                </Button>

                <Button
                  onClick={handleShareBand}
                  variant="outline"
                  className="border-[#333] text-white hover:bg-[#1a1a1a] font-bold"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="mr-1.5 text-[#a8f776]" /> Copiado
                    </>
                  ) : (
                    <>
                      <Share2 size={16} className="mr-1.5 text-[#a8f776]" /> Compartilhar
                    </>
                  )}
                </Button>

                {isOwner && (
                  <Button onClick={() => navigate("/my-band")} variant="outline" className="border-[#333] text-white hover:bg-[#1a1a1a]">
                    Editar página
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-[1200px] mx-auto -mt-4">
        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2 space-y-8">
            {band.bio && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3">Sobre</h2>
                <p className="text-[#c0c0c0] text-sm leading-relaxed whitespace-pre-wrap">{band.bio}</p>
              </section>
            )}

            {band.members && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Users size={16} /> Integrantes</h2>
                <p className="text-[#c0c0c0] text-sm whitespace-pre-wrap">{band.members}</p>
              </section>
            )}

            {/* SEÇÃO DE VÍDEOS & CLIPES */}
            {videos.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Youtube size={18} className="text-red-500" /> Vídeos & Clipes
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {videos.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveVideo(v.youtube_id)}
                      className="group bg-[#121212] border border-[#1e1e1e] hover:border-[#a8f776] rounded-lg overflow-hidden text-left transition-all"
                    >
                      <div className="aspect-video relative bg-black flex items-center justify-center overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                        <div className="w-10 h-10 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-bold text-white truncate group-hover:text-[#a8f776] transition-colors">
                          {v.title}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {band.rider_notes && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Music2 size={16} /> Rider Técnico & Input List</h2>
                <div className="bg-[#121212] border border-[#1e1e1e] p-4 rounded-lg font-mono text-xs text-[#d0d0d0] whitespace-pre-wrap leading-relaxed">
                  {band.rider_notes}
                </div>
              </section>
            )}

            {gallery.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><ImageIcon size={16} /> Galeria</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {gallery.map((url, i) => (
                    <button key={i} onClick={() => setLightbox(i)} className="aspect-square rounded-md overflow-hidden bg-[#222] group">
                      <img src={formatUrl(url)} alt="" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Music2 size={16} /> Músicas & links</h2>
              <div className="space-y-3">
                {tracks.map((t, i) => {
                  const url = t.url?.toLowerCase() || "";
                  const source = t.source?.toLowerCase() || "";
                  const isSpotify = source === "spotify" || url.includes("spotify.com");

                  if (isSpotify) {
                    const embedUrl = t.url.replace("open.spotify.com/", "open.spotify.com/embed/").split("?")[0];
                    return (
                      <div key={t.id || i} className="rounded-lg overflow-hidden border border-[#222] bg-[#121212]">
                        <iframe src={embedUrl} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title={t.title || "Spotify Player"} />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={t.id || i}
                      onClick={() => playTrackList(playableTracks.map((x) => ({ title: x.title, url: x.url, band_name: band.name, band_logo: formatUrl(band.logo_url || band.photo_url) })), playableTracks.findIndex((x) => x.id === t.id))}
                      className="w-full flex items-center gap-3 p-2.5 rounded-md bg-[#121212] border border-[#1e1e1e] hover:bg-[#181818] text-left group transition-colors"
                    >
                      <span className="w-6 text-center text-sm text-[#707070] group-hover:hidden">{i + 1}</span>
                      <Play size={14} className="text-[#a8f776] hidden group-hover:block shrink-0" fill="currentColor" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{t.title}</div>
                        <div className="text-xs text-[#707070] capitalize">{t.source || "Link"}</div>
                      </div>
                      <a href={t.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[#606060] hover:text-white">
                        <ExternalLink size={14} />
                      </a>
                    </button>
                  );
                })}
                {tracks.length === 0 && <p className="text-[#505050] text-sm py-4">Nenhuma música cadastrada ainda.</p>}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5">
              <h3 className="text-sm font-bold text-white mb-2">Material para Contratantes</h3>
              <p className="text-xs text-[#808080] leading-relaxed mb-4">
                Baixe o Press Kit com histórico, fotos, repertório e rider técnico completo em um PDF profissional.
              </p>
              <Button
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className="w-full bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <FileDown size={15} />
                {generatingPDF ? "Gerando PDF..." : "BAIXAR PRESS KIT (PDF)"}
              </Button>
            </section>

            {(band.whatsapp || band.email || band.instagram) && (
              <section className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-4">
                <h3 className="text-sm font-bold text-white mb-3">Contato</h3>
                <div className="space-y-2 text-sm">
                  {band.whatsapp && <a href={`https://wa.me/${band.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#c0c0c0] hover:text-white"><Phone size={14} className="text-[#a8f776]" /> {band.whatsapp}</a>}
                  {band.email && <a href={`mailto:${band.email}`} className="flex items-center gap-2 text-[#c0c0c0] hover:text-white"><Mail size={14} className="text-[#a8f776]" /> {band.email}</a>}
                  {band.instagram && <a href={`https://instagram.com/${band.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#c0c0c0] hover:text-white"><Instagram size={14} className="text-[#a8f776]" /> {band.instagram}</a>}
                  {band.youtube && <a href={band.youtube.startsWith("http") ? band.youtube : `https://youtube.com/${band.youtube}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#c0c0c0] hover:text-white"><Youtube size={14} className="text-[#a8f776]" /> {band.youtube}</a>}
                  {band.facebook && <a href={band.facebook.startsWith("http") ? band.facebook : `https://facebook.com/${band.facebook.replace("/", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#c0c0c0] hover:text-white"><Facebook size={14} className="text-[#a8f776]" /> {band.facebook}</a>}
                </div>
              </section>
            )}
          </div>
        </div>

        <section className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-4 mt-8">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><MessageSquare size={15} className="text-[#a8f776]" /> Mural da banda</h3>
          {user ? (
            <div className="mb-3">
              <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Notinha..." className="bg-[#0a0a0a] border-[#222] text-[#fff] text-sm" rows={2} />
              <Button onClick={addNote} size="sm" className="bg-[#a8f776] text-black hover:bg-[#8fd862] mt-2 w-full">Postar</Button>
            </div>
          ) : (
            <p className="text-xs text-[#707070] mb-3"><Link to="/login" className="text-[#a8f776] underline">Entre</Link> para postar.</p>
          )}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notes.map((n) => (
              <div key={n.id} className="bg-[#0e0e0e] border border-[#1a1a1a] rounded p-2">
                <div className="text-xs text-[#c0c0c0] whitespace-pre-wrap">{renderWithLinks(n.content)}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-[#606060]">— {n.author_name || "Anônimo"}</span>
                  {user && n.created_by_id === user.id && (
                    <button onClick={() => deleteNote(n.id)} className="text-[#505050] hover:text-red-400"><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
            ))}
            {notes.length === 0 && <p className="text-[#505050] text-xs">Mural vazio.</p>}
          </div>
        </section>
      </div>

      {/* MODAL DO PLAYER DE VÍDEO */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
          <div className="relative w-full max-w-4xl bg-[#121212] border border-[#222] rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-10 text-white/80 hover:text-white bg-black/60 rounded-full p-2 backdrop-blur-sm transition-colors"
            >
              <X size={20} />
            </button>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                title="YouTube Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX DE FOTOS */}
      {lightbox !== null && gallery[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightbox(null)}><X size={28} /></button>
          {gallery.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + gallery.length) % gallery.length); }}><ChevronLeft size={24} /></button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 rounded-full p-2" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % gallery.length); }}><ChevronRight size={24} /></button>
            </>
          )}
          <img src={formatUrl(gallery[lightbox])} alt="" className="max-w-[90vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}