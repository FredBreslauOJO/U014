/**
 * Converte qualquer imagem (JPG, PNG, etc) para WebP e reduz seu tamanho/resolução.
 * @param {File} file - Arquivo original do input file
 * @param {number} maxWidth - Largura máxima permitida (padrão: 1200px)
 * @param {number} quality - Qualidade da compressão de 0 a 1 (padrão: 0.8 / 80%)
 * @returns {Promise<File>} - Retorna o arquivo compactado em formato .webp
 */
export async function compressAndConvertToWebP(file, maxWidth = 1200, quality = 0.8) {
  // Se não for imagem ou se for GIF animado, não altera
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let width = img.width;
      let height = img.height;

      // Redimensiona mantendo a proporção caso seja maior que o limite
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Converte o canvas para Blob no formato WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // Em caso de erro, devolve a imagem original
            return;
          }

          // Nomeia o novo arquivo com extensão .webp
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${cleanName}.webp`, {
            type: "image/webp",
          });

          resolve(compressedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => resolve(file); // Fallback para imagem original se falhar
  });
}