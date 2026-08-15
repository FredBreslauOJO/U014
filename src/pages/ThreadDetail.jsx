import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, MessageSquare, ImageIcon, X } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ThreadNode from "@/components/ThreadNode";
import HeatFlames from "@/components/HeatFlames";
import { collectThreadDates, computeHeat } from "@/lib/threadHeat";

// Helper para formatar URLs
const formatUrl = (url) => {
  if (!url) return "";
  let cleaned = String(url).replace("https://tgxzkvhqzyxjt.supabase.co", "https://otbjufhtgxzkvhqzyxjt.supabase.co");
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    return `https://otbjufhtgxzkvhqzyxjt.supabase.co/storage/v1/object/public/underground-images/${cleaned}`;
  }
  return cleaned;
};

// Sistema de Compressão Agressiva via Canvas (Max 1000px, WebP, 80% qualidade)
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
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          const fileName = `thread_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
          const compressedFile = new File([blob], fileName, { type: "image/webp" });

          const { data, error } = await supabase.storage
            .from("underground-images")
            .upload(`threads/${fileName}`, compressedFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error("Upload error:", error);
            resolve(null);
          } else {
            resolve(data.path);
          }
        }, "image/webp", 0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function ThreadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [childrenMap, setChildrenMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  // States do formulário de resposta
  const [topic, setTopic] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  // Modal (Lightbox)
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const load = async () => {
    try {
      const [{ data: t }, { data: all }] = await Promise.all([
        supabase.from('threads').select('*').eq('id', id).single(),
        supabase.from('threads').select('*').order('created_date', { ascending: false })
      ]);
      setThread(t || null);
      const map = {};
      (all || []).forEach((r) => {
        if (r.parent_id) {
          (map[r.parent_id] = map[r.parent_id] || []).push(r);
        }
      });
      setChildrenMap(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addTopic = async () => {
    if (!topic.trim() || !user) return;
    setSending(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await processAndUploadImage(imageFile);
      }

      const payload = {
        content: topic.trim(),
        image_url: imageUrl,
        parent_id: id,
        author_name: user.full_name || user.email,
        category: thread?.category || "geral",
        created_by_id: user.id
      };
      
      const { data: created, error } = await supabase.from('threads').insert([payload]).select().single();
      if (!error && created) {
        setChildrenMap((m) => ({ ...m, [id]: [...(m[id] || []), created] }));
        setTopic("");
        removeImage();
      }
    } finally {
      setSending(false);
    }
  };

  const onReply = async (parentId, text) => {
    const payload = {
      content: text,
      parent_id: parentId,
      author_name: user.full_name || user.email,
      category: thread?.category || "geral",
      created_by_id: user?.id
    };
    const { data: created, error } = await supabase.from('threads').insert([payload]).select().single();
    if (!error && created) {
      setChildrenMap((m) => ({ ...m, [parentId]: [...(m[parentId] || []), created] }));
    }
  };

  const onDelete = async (node) => {
    await supabase.from('threads').delete().eq('id', node.id);
    setChildrenMap((m) => {
      const next = {};
      Object.entries(m).forEach(([k, arr]) => {
        next[k] = arr.filter((x) => x.id !== node.id);
      });
      return next;
    });
  };

  if (loading) return <div className="px-8 py-20 text-center text-[#606060] text-sm">Carregando...</div>;
  if (!thread) return <div className="px-8 py-20 text-center text-[#606060] text-sm">Thread não encontrada.</div>;

  const topics = (childrenMap[id] || []).slice().sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const heat = computeHeat(collectThreadDates(childrenMap, id, thread.created_date));

  return (
    <div className="px-4 md:px-8 py-6 max-w-[800px] mx-auto">
      <Link to="/threads" className="inline-flex items-center gap-1.5 text-sm text-[#808080] hover:text-white mb-4">
        <ArrowLeft size={15} /> Voltar
      </Link>

      {/* Main Thread Card */}
      <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 mb-4">
        <span className="text-[10px] uppercase tracking-wider text-[#a8f776] bg-[#a8f776]/10 px-2 py-0.5 rounded">{thread.category || "geral"}</span>
        {heat > 0 && <HeatFlames level={heat} size={17} />}
        <h1 className="text-2xl font-black text-white tracking-tight mt-3">{thread.title || "Sem título"}</h1>
        <div className="flex items-center gap-2 mt-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#a8f776] font-bold text-xs">
            {(thread.author_name || "?").charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-[#808080]">{thread.author_name || "Anônimo"} · {new Date(thread.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        
        <p className="text-[#d0d0d0] text-sm whitespace-pre-wrap leading-relaxed">{thread.content}</p>

        {/* Thumbnail Clicável para o Lightbox */}
        {thread.image_url && (
          <div className="mt-4">
            <img 
              src={formatUrl(thread.image_url)} 
              alt="Anexo da thread" 
              onClick={() => setLightboxOpen(true)}
              className="max-h-64 rounded border border-[#222] cursor-zoom-in hover:opacity-80 transition-opacity" 
            />
          </div>
        )}
      </div>

      {/* Formulário de Resposta */}
      {user ? (
        <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-3 mb-5">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Começa um novo tópico na conversa..."
                className="bg-[#0a0a0a] border-[#222] resize-none w-full"
                rows={2}
              />
              {imagePreview && (
                 <div className="relative inline-block border border-[#333] rounded-md overflow-hidden">
                   <img src={imagePreview} alt="Preview" className="max-h-24 object-contain bg-black" />
                   <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
                     <X size={12} />
                   </button>
                 </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2 shrink-0">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-[#1a1a1a] border-[#333] text-[#a0a0a0] hover:text-white px-3" title="Anexar Imagem">
                <ImageIcon size={16} />
              </Button>
              <Button onClick={addTopic} disabled={sending || !topic.trim()} className="bg-[#a8f776] text-black hover:bg-[#8fd862] flex-1">
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#707070] text-center mb-5">
          <Link to="/login" className="text-[#a8f776] underline">Entre</Link> para participar.
        </p>
      )}

      {/* Lista de Respostas */}
      <div className="space-y-2">
        {topics.map((t) => (
          <ThreadNode key={t.id} node={t} childrenMap={childrenMap} user={user} onReply={onReply} onDelete={onDelete} depth={0} />
        ))}
        {topics.length === 0 && (
          <div className="text-center py-12 text-[#606060]">
            <MessageSquare size={30} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum tópico ainda. {user ? "Abre o primeiro!" : ""}</p>
          </div>
        )}
      </div>

      {/* Lightbox / Imagem Expandida */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl bg-transparent border-none shadow-none flex justify-center items-center p-0">
          {thread?.image_url && (
            <img 
              src={formatUrl(thread.image_url)} 
              alt="Imagem expandida" 
              className="max-w-full max-h-[85vh] object-contain rounded-md" 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}