import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { supabase } from "@/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function BannerSubmit({ open, onClose, onSubmit }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    category: "destaque",
    accent: "#a8f776",
  });
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('underground-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('underground-images')
        .getPublicUrl(filePath);

      set("image_url", data.publicUrl);
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (e) {
      toast({ title: "Erro ao subir imagem", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image_url) {
      toast({ title: "Informe o título e selecione uma imagem", variant: "destructive" });
      return;
    }
    onSubmit(form);
    setForm({ title: "", subtitle: "", image_url: "", link_url: "", category: "destaque", accent: "#a8f776" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-[#222] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Sugerir Banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label className="text-[#b0b0b0]">Título *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-[#0a0a0a] border-[#222] mt-1" required />
          </div>

          <div>
            <Label className="text-[#b0b0b0]">Subtítulo</Label>
            <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="bg-[#0a0a0a] border-[#222] mt-1" />
          </div>

          <div>
            <Label className="text-[#b0b0b0]">Imagem do Banner *</Label>
            <div className="mt-1">
              {form.image_url ? (
                <div className="relative w-full h-32 rounded-md overflow-hidden border border-[#222]">
                  <img src={form.image_url} alt="banner" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => set("image_url", "")} className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black">
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-[#333] rounded-md cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                  {uploading ? (
                    <span className="text-xs text-[#707070]">Enviando imagem...</span>
                  ) : (
                    <>
                      <Upload size={20} className="text-[#606060]" />
                      <span className="text-xs text-[#606060] mt-1">Clique para enviar imagem</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])} />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label className="text-[#b0b0b0]">Link de Destino</Label>
            <Input value={form.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="https://..." className="bg-[#0a0a0a] border-[#222] mt-1" />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={uploading} className="bg-[#a8f776] text-black hover:bg-[#8fd862] w-full font-bold">
              Sugerir Banner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}