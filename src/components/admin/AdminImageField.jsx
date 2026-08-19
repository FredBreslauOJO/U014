import React, { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/utils/upload";
import { formatUrl } from "@/lib/supabaseStorage";

export default function AdminImageField({ label, value, onChange, folder = "uploads" }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="text-xs font-semibold text-[#a0a0a0] block mb-1">{label}</label>
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleSelect} />
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-16 h-16 shrink-0">
            <img src={formatUrl(value)} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#222]" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1.5 -right-1.5 bg-black/80 hover:bg-red-500 text-white rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#505050] shrink-0">
            <ImagePlus size={18} />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border-[#333] text-white hover:bg-[#1a1a1a]"
        >
          {uploading ? "Enviando..." : value ? "Trocar imagem" : "Enviar imagem"}
        </Button>
      </div>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ou cole uma URL de imagem"
        className="bg-[#0a0a0a] border-[#222] text-white text-xs mt-2"
      />
    </div>
  );
}
