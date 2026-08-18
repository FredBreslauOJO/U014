import React, { useState, useEffect, useRef } from "react";
import { Newspaper, Plus, Trash2, Calendar, Share2, ExternalLink, ImageIcon, X, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatUrl } from "@/lib/supabaseStorage";

// Compressão Agressiva via Canvas (WebP, Max 1000px)
const processAndUploadImage = async (file) => {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
        const MAX_SIZE = 1000;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(async (blob) => {
          const fileName = `news_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
          const compressedFile = new File([blob], fileName, { type: "image/webp" });
          const { data, error } = await supabase.storage.from("underground-images").upload(`news/${fileName}`, compressedFile, { cacheControl: "3600", upsert: false });
          if (error) { console.error("Upload error:", error); resolve(null); } else { resolve(data.path); }
        }, "image/webp", 0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function News() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // States Gerais
  const [news, setNews] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // States do Formulário
  const [form, setForm] = useState({ title: "", content: "", category: "geral", external_link: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // States de Leitura Expandida (Lightbox / Modal)
  const [expandedNews, setExpandedNews] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('news').select('*').order('created_date', { ascending: false });
    setNews(data || []);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Handlers de Imagem no Formulário
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };
  const removeImage = () => {
    setImageFile(null); setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const create = async () => {
    if (!form.title.trim() || !form.content.trim()) { 
      toast({ title: "Título e conteúdo obrigatórios", variant: "destructive" }); return; 
    }
    setSaving(true);
    try {
      let imageUrl = null;
      if (imageFile) imageUrl = await processAndUploadImage(imageFile);

      const payload = {
        ...form,
        image_url: imageUrl,
        author_name: user?.full_name || user?.email,
        created_by_id: user?.id
      };
      const { error } = await supabase.from('news').insert([payload]);
      if (error) throw error;

      toast({ title: "Notícia publicada!" });
      setForm({ title: "", content: "", category: "geral", external_link: "" });
      removeImage();
      setOpen(false);
      load();
    } catch (err) {
      toast({ title: "Erro ao publicar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeNews = async (id, e) => {
    e.stopPropagation();
    await supabase.from('news').delete().eq('id', id);
    setNews(news.filter((n) => n.id !== id));
  };

  // Funções da Leitura Expandida
  const openNews = async (n) => {
    setExpandedNews(n);
    const { data } = await supabase.from('news_comments').select('*').eq('news_id', n.id).order('created_date', { ascending: true });
    setComments(data || []);
  };

  const shareNews = async () => {
    if (!expandedNews) return;
    const shareData = {
      title: expandedNews.title,
      text: expandedNews.content.substring(0, 100) + "...",
      url: window.location.href, // Compartilha a URL da página de notícias
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({ title: "Link copiado para a área de transferência!" });
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !user) return;
    setSendingComment(true);
    try {
      const payload = {
        news_id: expandedNews.id,
        content: newComment.trim(),
        author_name: user.full_name || user.email,
        created_by_id: user.id
      };
      const { data, error } = await supabase.from('news_comments').insert([payload]).select().single();
      if (!error && data) {
        setComments([...comments, data]);
        setNewComment("");
      }
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2"><Newspaper className="text-[#a8f776]" /> Notícias</h1>
          <p className="text-[#808080] text-sm mt-1">Portal da cena underground</p>
        </div>
        {user && (
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) removeImage(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#a8f776] text-black hover:bg-[#8fd862]"><Plus size={16} className="mr-1" /> Publicar</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-[#222] text-white max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-white">Publicar notícia</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-[#b0b0b0]">Título *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-[#0a0a0a] border-[#222]" /></div>
                <div><Label className="text-[#b0b0b0]">Categoria</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="geral, show, lançamento..." className="bg-[#0a0a0a] border-[#222]" /></div>
                
                <div>
                  <Label className="text-[#b0b0b0]">Thumbnail</Label>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                  {!imagePreview ? (
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full bg-[#1a1a1a] border-[#333] text-[#a0a0a0] hover:text-white hover:bg-[#222] mt-1">
                      <ImageIcon size={16} className="mr-2" /> Anexar Foto
                    </Button>
                  ) : (
                    <div className="relative inline-block mt-1 border border-[#333] rounded-md overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="max-h-32 object-cover bg-black" />
                      <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition-colors"><X size={14} /></button>
                    </div>
                  )}
                </div>

                <div><Label className="text-[#b0b0b0]">Conteúdo *</Label><Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={6} className="bg-[#0a0a0a] border-[#222] resize-none" /></div>
                <div><Label className="text-[#b0b0b0]">Link Externo (Matéria original, etc.)</Label><Input value={form.external_link} onChange={(e) => set("external_link", e.target.value)} placeholder="https://..." className="bg-[#0a0a0a] border-[#222]" /></div>
                <Button onClick={create} disabled={saving} className="bg-[#a8f776] text-black hover:bg-[#8fd862] w-full mt-2">
                  {saving ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {news.map((n) => (
          <article 
            key={n.id} 
            onClick={() => openNews(n)}
            className="bg-[#121212] border border-[#1e1e1e] rounded-lg overflow-hidden group cursor-pointer hover:border-[#333] hover:bg-[#151515] transition-all"
          >
            <div className="flex flex-col md:flex-row">
              {n.image_url ? (
                <img src={formatUrl(n.image_url)} alt={n.title} className="w-full md:w-64 h-48 md:h-auto object-cover shrink-0" />
              ) : (
                <div className="w-full md:w-64 h-48 md:h-auto shrink-0 bg-[#1a1a1a] flex items-center justify-center border-r border-[#1e1e1e]">
                  <Newspaper size={40} className="text-[#333]" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#a8f776] uppercase tracking-widest font-bold">{n.category}</span>
                      <span className="text-[10px] text-[#606060] flex items-center gap-1"><Calendar size={10} /> {new Date(n.created_date).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {user && n.created_by_id === user.id && (
                      <button onClick={(e) => removeNews(n.id, e)} className="text-[#404040] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-[#a8f776] transition-colors">{n.title}</h2>
                  <p className="text-sm text-[#b0b0b0] mt-2 whitespace-pre-wrap line-clamp-3">{n.content}</p>
                </div>
                <p className="text-xs text-[#606060] mt-4 font-medium">— {n.author_name || "Anônimo"}</p>
              </div>
            </div>
          </article>
        ))}
        {news.length === 0 && <p className="text-[#505050] text-sm text-center py-12">Nenhuma notícia publicada. {user && "Publique a primeira!"}</p>}
      </div>

      {/* Modal de Leitura Expandida */}
      <Dialog open={!!expandedNews} onOpenChange={(val) => !val && setExpandedNews(null)}>
        <DialogContent className="bg-[#121212] border-[#222] text-white max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {expandedNews && (
            <>
              {/* Header com Imagem */}
              <div className="relative shrink-0">
                {expandedNews.image_url ? (
                  <img src={formatUrl(expandedNews.image_url)} alt="Thumbnail" className="w-full h-48 sm:h-64 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-gradient-to-r from-[#1a1a1a] to-[#121212] border-b border-[#222]" />
                )}
                <div className="absolute top-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-xs">
                   <span className="text-[#a8f776] font-bold uppercase tracking-wider">{expandedNews.category}</span>
                   <span className="text-[#a0a0a0] flex items-center gap-1"><Calendar size={12} /> {new Date(expandedNews.created_date).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>

              {/* Corpo Roolável */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 custom-scrollbar">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">{expandedNews.title}</h1>
                <p className="text-[#d0d0d0] text-[15px] leading-relaxed whitespace-pre-wrap">{expandedNews.content}</p>
                
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#222] pt-4">
                  {expandedNews.external_link && (
                    <a href={expandedNews.external_link.startsWith('http') ? expandedNews.external_link : `https://${expandedNews.external_link}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="bg-[#1a1a1a] border-[#333] text-white hover:bg-[#222] h-9">
                        <ExternalLink size={14} className="mr-2" /> Ler Matéria Original
                      </Button>
                    </a>
                  )}
                  <Button onClick={shareNews} variant="outline" className="bg-[#1a1a1a] border-[#333] text-white hover:bg-[#222] h-9">
                    <Share2 size={14} className="mr-2" /> Compartilhar
                  </Button>
                  <span className="ml-auto text-xs text-[#606060] font-medium">— Por {expandedNews.author_name || "Anônimo"}</span>
                </div>

                {/* Seção de Comentários */}
                <div className="mt-8 bg-[#0a0a0a] rounded-lg border border-[#1e1e1e] p-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-[#a0a0a0]">
                    <MessageSquare size={16} /> Comentários ({comments.length})
                  </h3>
                  
                  <div className="space-y-4 mb-5">
                    {comments.map((c) => (
                      <div key={c.id} className="border-l-2 border-[#222] pl-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#a8f776] text-[10px] font-bold">
                            {(c.author_name || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-white">{c.author_name || "Anônimo"}</span>
                          <span className="text-[10px] text-[#606060]">{new Date(c.created_date).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-sm text-[#c0c0c0] whitespace-pre-wrap">{c.content}</p>
                      </div>
                    ))}
                    {comments.length === 0 && <p className="text-xs text-[#505050]">Seja o primeiro a comentar.</p>}
                  </div>

                  {user ? (
                    <div className="flex gap-2">
                      <Input 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)} 
                        placeholder="Deixe um comentário..." 
                        className="bg-[#121212] border-[#222] h-9 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && addComment()}
                      />
                      <Button onClick={addComment} disabled={sendingComment || !newComment.trim()} className="bg-[#a8f776] text-black hover:bg-[#8fd862] h-9 px-3">
                        <Send size={14} />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-[#606060]">Faça login para comentar.</p>
                  )}
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
