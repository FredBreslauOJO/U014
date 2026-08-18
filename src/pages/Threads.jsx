import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, MessageSquare, ChevronRight, ImageIcon, X } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import HeatFlames from "@/components/HeatFlames";
import { collectThreadDates, computeHeat } from "@/lib/threadHeat";
import { formatUrl } from "@/lib/supabaseStorage";

const categories = ["geral", "shows", "parcerias", "releases", "off-topic"];

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

export default function Threads() {
  const [threads, setThreads] = useState([]);
  const [counts, setCounts] = useState({});
  const [childrenMap, setChildrenMap] = useState({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "geral" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const load = async () => {
    const { data: all } = await supabase.from('threads').select('*').order('created_date', { ascending: false });
    if (!all) return;

    const tops = all.filter((t) => !t.parent_id);
    const replyCounts = {};
    const map = {};
    all.filter((t) => t.parent_id).forEach((r) => {
      replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1;
      (map[r.parent_id] = map[r.parent_id] || []).push(r);
    });
    setThreads(tops);
    setCounts(replyCounts);
    setChildrenMap(map);
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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

  const create = async () => {
    if (!form.title.trim() || !form.content.trim() || !user) return;
    setSaving(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await processAndUploadImage(imageFile);
      }

      const payload = {
        ...form,
        image_url: imageUrl,
        author_name: user.full_name || user.email,
        created_by_id: user.id
      };
      
      await supabase.from('threads').insert([payload]);
      
      setForm({ title: "", content: "", category: "geral" });
      removeImage();
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Threads</h1>
          <p className="text-sm text-[#808080] mt-1">Conversas da cena. Abre um tópico, responde, combina parcerias.</p>
        </div>
        {user && (
          <Button onClick={() => setOpen(true)} className="bg-[#a8f776] text-black hover:bg-[#8fd862]">
            <Plus size={16} className="mr-1" /> Novo thread
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {threads.map((t) => {
          const heat = computeHeat(collectThreadDates(childrenMap, t.id, t.created_date));
          return (
          <Link key={t.id} to={`/threads/${t.id}`} className="block bg-[#121212] border border-[#1e1e1e] rounded-lg p-4 hover:bg-[#181818] transition-colors group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 text-[#a8f776] font-bold text-sm overflow-hidden">
                {(t.author_name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#a8f776] bg-[#a8f776]/10 px-2 py-0.5 rounded">{t.category || "geral"}</span>
                  {heat > 0 && <HeatFlames level={heat} size={14} />}
                  <span className="text-xs text-[#707070]">{t.author_name || "Anônimo"}</span>
                </div>
                <div className="font-semibold text-white text-[15px] truncate group-hover:text-[#a8f776] transition-colors">{t.title || "Sem título"}</div>
                <div className="text-sm text-[#909090] line-clamp-1 mt-0.5">{t.content}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-[#707070]">
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {counts[t.id] || 0} respostas</span>
                  {t.image_url && <span className="flex items-center gap-1"><ImageIcon size={12} /> Foto</span>}
                  <span>{new Date(t.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                </div>
              </div>
              {t.image_url && (
                <div className="hidden sm:block w-16 h-16 rounded overflow-hidden shrink-0 border border-[#222]">
                   <img src={formatUrl(t.image_url)} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
              <ChevronRight size={18} className="text-[#404040] group-hover:text-white mt-2 transition-colors shrink-0" />
            </div>
          </Link>
          );
        })}
        {threads.length === 0 && (
          <div className="text-center py-16 text-[#606060]">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum thread ainda. {user ? "Abre o primeiro!" : "Entre pra começar."}</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) removeImage(); }}>
        <DialogContent className="bg-[#121212] border-[#222] text-white max-w-lg">
          <DialogHeader><DialogTitle>Novo thread</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-[#b0b0b0]">Título</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-[#0a0a0a] border-[#222]" placeholder="Assunto do tópico" />
            </div>
            <div>
              <Label className="text-[#b0b0b0]">Categoria</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {categories.map((c) => (
                  <button key={c} type="button" onClick={() => set("category", c)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.category === c ? "bg-[#a8f776] text-black border-[#a8f776]" : "bg-transparent text-[#909090] border-[#333] hover:border-[#555]"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[#b0b0b0]">Mensagem</Label>
              <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} className="bg-[#0a0a0a] border-[#222] resize-none" rows={4} placeholder="Escreve a abertura do tópico..." />
            </div>
            
            {/* Seção de Upload de Imagem */}
            <div>
               <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
               {!imagePreview ? (
                 <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full bg-[#1a1a1a] border-[#333] text-[#a0a0a0] hover:text-white hover:bg-[#222]">
                   <ImageIcon size={16} className="mr-2" /> Anexar Imagem
                 </Button>
               ) : (
                 <div className="relative inline-block mt-2 border border-[#333] rounded-md overflow-hidden">
                   <img src={imagePreview} alt="Preview" className="max-h-32 object-contain bg-black" />
                   <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
                     <X size={14} />
                   </button>
                 </div>
               )}
            </div>

          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="text-[#a0a0a0]">Cancelar</Button>
            <Button onClick={create} disabled={saving || !form.title.trim() || !form.content.trim()} className="bg-[#a8f776] text-black hover:bg-[#8fd862]">
              {saving ? "Publicando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
