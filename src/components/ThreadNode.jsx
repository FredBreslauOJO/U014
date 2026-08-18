import React, { useState, useRef } from "react";
import { Trash2, ChevronRight, Reply, Send, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/supabase";
import HeatFlames from "@/components/HeatFlames";
import { collectThreadDates, computeHeat } from "@/lib/threadHeat";
import { formatUrl } from "@/lib/supabaseStorage";

function Avatar({ name }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#a8f776] font-bold text-xs shrink-0">
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function timeStr(d) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

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
          const fileName = `thread_reply_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
          const compressedFile = new File([blob], fileName, { type: "image/webp" });

          const { data, error } = await supabase.storage
            .from("underground-images")
            .upload(`threads/${fileName}`, compressedFile, { cacheControl: "3600", upsert: false });

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

export default function ThreadNode({ node, childrenMap, user, onReply, onDelete, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  const children = (childrenMap[node.id] || []).slice().sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const canDelete = user && (user.id === node.created_by_id || user.role === "admin");
  const isTopic = depth === 0;
  const heat = isTopic ? computeHeat(collectThreadDates(childrenMap, node.id, node.created_date)) : 0;

  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 10) { alert("Máximo de 10 imagens."); return; }
    const newFiles = [...imageFiles, ...files].slice(0, 10);
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles]; newFiles.splice(index, 1);
    setImageFiles(newFiles); setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!text.trim() && imageFiles.length === 0) return;
    setSending(true);
    try {
      const uploadedPaths = await Promise.all(imageFiles.map(f => processAndUploadImage(f)));
      const validPaths = uploadedPaths.filter(Boolean);
      const joinedPaths = validPaths.length > 0 ? validPaths.join(",") : null;

      // Chama a função onReply passando a string de imagens como 3º parâmetro
      await onReply(node.id, text.trim(), joinedPaths);
      
      setText("");
      setImageFiles([]);
      setImagePreviews([]);
      setComposing(false);
      setCollapsed(false);
    } finally {
      setSending(false);
    }
  };

  const nodeImages = node.image_url ? node.image_url.split(',').filter(Boolean) : [];

  return (
    <div className={depth > 0 ? "ml-3 md:ml-5 border-l border-[#222] pl-3 md:pl-4" : ""}>
      <div className={`bg-[#121212] border rounded-md p-3 ${isTopic ? "border-[#1e1e1e] border-l-2 border-l-[#a8f776]" : "border-[#1a1a1a]"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar name={node.author_name} />
            <span className="text-xs font-medium text-white truncate">{node.author_name || "Anônimo"}</span>
            {isTopic && <span className="text-[9px] uppercase tracking-wider text-[#a8f776] bg-[#a8f776]/10 px-1.5 py-0.5 rounded">Tópico</span>}
            {heat > 0 && <HeatFlames level={heat} size={14} />}
            <span className="text-[10px] text-[#606060] shrink-0">{timeStr(node.created_date)}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {children.length > 0 && (
              <button onClick={() => setCollapsed((c) => !c)} className="flex items-center gap-1 text-[10px] text-[#707070] hover:text-white px-1.5 py-1 rounded hover:bg-[#1a1a1a] transition-colors">
                <ChevronRight size={12} className={`transition-transform ${collapsed ? "" : "rotate-90"}`} />
                {children.length}
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(node)} className="text-[#404040] hover:text-red-400 p-1 transition-colors">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-[#c0c0c0] mt-2 whitespace-pre-wrap">{node.content}</p>

        {/* Exibição das imagens da resposta */}
        {nodeImages.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {nodeImages.map((imgUrl, idx) => (
              <img 
                key={idx}
                src={formatUrl(imgUrl)} 
                alt={`Anexo ${idx + 1}`} 
                onClick={() => { setLightboxImage(imgUrl); setLightboxOpen(true); }}
                className="w-full h-24 object-cover rounded border border-[#222] cursor-zoom-in hover:opacity-80 transition-opacity" 
              />
            ))}
          </div>
        )}

        {user && (
          <button onClick={() => setComposing((c) => !c)} className="mt-3 text-[11px] text-[#a8f776] hover:underline flex items-center gap-1">
            <Reply size={11} /> Responder
          </button>
        )}
        
        {/* Caixa de composição de resposta com upload múltiplo */}
        {composing && user && (
          <div className="mt-2 bg-[#0a0a0a] border border-[#222] p-2 rounded flex flex-col gap-2">
            <Textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Responde..." 
              className="bg-transparent border-none focus-visible:ring-0 resize-none flex-1 p-1 text-sm text-white" 
              rows={2} 
            />

            {imagePreviews.length > 0 && (
               <div className="flex flex-wrap gap-2 px-1">
                 {imagePreviews.map((preview, i) => (
                   <div key={i} className="relative border border-[#333] rounded-md overflow-hidden w-14 h-14">
                     <img src={preview} alt="Preview" className="w-full h-full object-cover bg-black" />
                     <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
                       <X size={10} />
                     </button>
                   </div>
                 ))}
               </div>
            )}

            <div className="flex justify-between items-center mt-1 border-t border-[#222] pt-2">
               <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleImagesSelect} />
               <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={imageFiles.length >= 10} className="text-[#a0a0a0] hover:text-white px-2 h-8">
                 <ImageIcon size={14} className="mr-1" /> <span className="text-[10px]">({imageFiles.length}/10)</span>
               </Button>
               <Button onClick={submit} disabled={sending || (!text.trim() && imageFiles.length === 0)} className="bg-[#a8f776] text-black hover:bg-[#8fd862] h-8 px-3 text-xs">
                 {sending ? "Enviando..." : <><Send size={12} className="mr-1" /> Enviar</>}
               </Button>
            </div>
          </div>
        )}
      </div>

      {!collapsed && children.length > 0 && (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <ThreadNode key={child.id} node={child} childrenMap={childrenMap} user={user} onReply={onReply} onDelete={onDelete} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Lightbox do Node */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl bg-transparent border-none shadow-none flex justify-center items-center p-0">
          <DialogTitle className="sr-only">Imagem expandida do tópico</DialogTitle>
          {lightboxImage && (
            <img src={formatUrl(lightboxImage)} alt="Expandida" className="max-w-full max-h-[85vh] object-contain rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
