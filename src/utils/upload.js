import { supabase } from "@/supabase";
import { compressAndConvertToWebP } from "./compressImage";

export async function uploadImage(file, folder = "uploads") {
  if (!file) return null;

  // 1. Compacta no navegador antes de enviar
  const compressedFile = await compressAndConvertToWebP(file, 1200, 0.8);

  // 2. Gera nome único com extensão .webp
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;

  // 3. Envia para o Supabase Storage
  const { error } = await supabase.storage
    .from("underground-images")
    .upload(fileName, compressedFile, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    console.error("Erro no upload da imagem:", error);
    throw new Error("Erro ao fazer upload da imagem.");
  }

  // 4. Retorna a URL pública
  const { data } = supabase.storage
    .from("underground-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}