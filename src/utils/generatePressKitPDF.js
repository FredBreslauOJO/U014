import { jsPDF } from "jspdf";
import { formatUrl } from "@/lib/supabaseStorage";

// Função blindada para processar, cortar e converter imagens sem distorcer
const getImageData = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
      let destW = img.width, destH = img.height;

      // 1. Tratamento da Hero Image (Corta em Banner 2.35:1 para não distorcer)
      if (options.isHero) {
        const targetRatio = 2.35; 
        const currentRatio = img.width / img.height;
        if (currentRatio > targetRatio) {
          srcW = img.height * targetRatio;
          srcX = (img.width - srcW) / 2;
        } else {
          srcH = img.width / targetRatio;
          srcY = (img.height - srcH) * 0.3; // Foco ligeiramente para cima
        }
        destW = srcW;
        destH = srcH;
      }

      // 2. Tratamento da Logo (Força proporção 1:1)
      if (options.isLogo) {
        const size = Math.min(img.width, img.height);
        srcW = size; 
        srcH = size;
        srcX = (img.width - size) / 2;
        srcY = (img.height - size) / 2;
        destW = size; 
        destH = size;
      }

      canvas.width = destW;
      canvas.height = destH;

      // Mascaras de corte
      if (options.isLogo) {
        ctx.beginPath();
        ctx.arc(destW / 2, destH / 2, destW / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "#0a0a0a"; 
        ctx.fill();
      } else if (options.isHero) {
        const r = Math.min(destW, destH) * 0.05;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(destW - r, 0);
        ctx.quadraticCurveTo(destW, 0, destW, r);
        ctx.lineTo(destW, destH - r);
        ctx.quadraticCurveTo(destW, destH, destW - r, destH);
        ctx.lineTo(r, destH);
        ctx.quadraticCurveTo(0, destH, 0, destH - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, destW, destH);

      const usePng = options.isLogo || options.isHero || url.toLowerCase().includes('.png');
      const format = usePng ? "image/png" : "image/jpeg";

      resolve({
        dataUrl: canvas.toDataURL(format, 0.95),
        width: destW,
        height: destH,
        format: usePng ? "PNG" : "JPEG"
      });
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

export async function generatePressKitPDF(band) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  
  let currentY = margin;

  // --- PÁGINA 1: INFORMAÇÕES E BIO ---
  
  let bottomOfHero = currentY;
  if (band.photo_url) {
    try {
      const heroImg = await getImageData(formatUrl(band.photo_url), { isHero: true });
      const imgRatio = heroImg.width / heroImg.height;
      const printHeight = contentWidth / imgRatio;
      
      doc.addImage(heroImg.dataUrl, heroImg.format, margin, currentY, contentWidth, printHeight);
      bottomOfHero = currentY + printHeight;
      currentY = bottomOfHero + 15;
    } catch (e) {
      console.warn("Erro ao carregar hero image.");
    }
  }

  if (band.logo_url) {
    try {
      const logoImg = await getImageData(formatUrl(band.logo_url), { isLogo: true });
      const logoSize = 35;
      const logoX = (pageWidth - logoSize) / 2;
      
      const logoY = band.photo_url ? bottomOfHero - (logoSize / 2) : margin;
      
      doc.setFillColor(255, 255, 255);
      doc.circle(pageWidth / 2, logoY + (logoSize / 2), (logoSize / 2) + 1.5, 'F');
      
      doc.addImage(logoImg.dataUrl, logoImg.format, logoX, logoY, logoSize, logoSize);
      currentY = Math.max(currentY, logoY + logoSize + 15);
    } catch (e) {
      console.warn("Erro ao carregar logo.");
    }
  }

  // TÍTULO E GÊNERO MUSICAL
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  const title = band.name.toUpperCase();
  doc.text(title, pageWidth / 2, currentY, { align: "center" });
  currentY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // ---> AQUI ESTÁ A CORREÇÃO <---
  // Verifica primeiro se a lista 'genres' existe e não está vazia. Se não tiver, busca o campo 'genre' legado.
  let extractedGenre = "Gênero não informado";
  if (Array.isArray(band.genres) && band.genres.length > 0) {
    extractedGenre = band.genres.join(", ");
  } else if (typeof band.genres === "string" && band.genres.trim() !== "") {
    extractedGenre = band.genres;
  } else if (band.genre && String(band.genre).trim() !== "") {
    extractedGenre = band.genre;
  }
  
  doc.text(extractedGenre.toUpperCase(), pageWidth / 2, currentY, { align: "center" });
  currentY += 6;

  // CONTATOS
  doc.setFontSize(9);
  const contactInfo = [
    band.city || "",
    band.contact_phone ? `Whatsapp: ${band.contact_phone}` : "",
    band.contact_email ? `Email: ${band.contact_email}` : "",
    band.instagram ? `Insta: ${band.instagram}` : ""
  ].filter(Boolean).join(" | ");
  doc.text(contactInfo, pageWidth / 2, currentY, { align: "center" });
  currentY += 18;

  if (band.bio) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Biografia", margin, currentY);
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const bioLines = doc.splitTextToSize(band.bio, contentWidth);
    doc.text(bioLines, margin, currentY);
    currentY += (bioLines.length * 5) + 10;
  }

  if (band.members) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Integrantes", margin, currentY);
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const memberLines = doc.splitTextToSize(band.members, contentWidth);
    doc.text(memberLines, margin, currentY);
    currentY += (memberLines.length * 5) + 10;
  }

  if (band.repertoire) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const durationText = band.show_duration ? ` (${band.show_duration})` : "";
    doc.text(`Repertório${durationText}`, margin, currentY);
    currentY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const repLines = doc.splitTextToSize(band.repertoire, contentWidth);
    doc.text(repLines, margin, currentY);
  }

  // --- PÁGINA 2: GALERIA ---
  if (band.gallery && band.gallery.length > 0) {
    doc.addPage();
    currentY = margin;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(band.name.toUpperCase(), margin, currentY);
    doc.setFontSize(10);
    doc.text("GALERIA DE FOTOS", margin, currentY + 6);
    currentY += 15;

    const gap = 4;
    const colWidth = (contentWidth - gap) / 2;
    let colY = [currentY, currentY]; 

    for (let i = 0; i < band.gallery.length; i++) {
      try {
        const galImg = await getImageData(formatUrl(band.gallery[i]));
        const imgRatio = galImg.width / galImg.height;
        const imgHeight = colWidth / imgRatio;

        let targetCol = colY[0] <= colY[1] ? 0 : 1;

        if (colY[targetCol] + imgHeight > pageHeight - margin) {
          doc.addPage();
          colY = [margin, margin];
          targetCol = 0;
        }

        const xPos = margin + (targetCol * (colWidth + gap));
        doc.addImage(galImg.dataUrl, galImg.format, xPos, colY[targetCol], colWidth, imgHeight);
        
        colY[targetCol] += imgHeight + gap;
      } catch(e) {
        console.warn("Erro ao carregar imagem da galeria");
      }
    }
  }

  // --- PÁGINA 3: RIDER TÉCNICO ---
  const hasTech = band.stage_plot_url || (band.tech_requirements && band.tech_requirements.length > 0) || band.tech_crew || band.tech_observations;
  
  if (hasTech) {
    doc.addPage();
    currentY = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(band.name.toUpperCase(), margin, currentY);
    doc.setFontSize(12);
    doc.text("RIDER TÉCNICO", margin, currentY + 6);
    currentY += 15;

    if (band.stage_plot_url) {
      try {
        const plotImg = await getImageData(formatUrl(band.stage_plot_url));
        const plotRatio = plotImg.width / plotImg.height;
        let pHeight = contentWidth / plotRatio;
        if (pHeight > 130) pHeight = 130;
        
        doc.addImage(plotImg.dataUrl, plotImg.format, margin, currentY, contentWidth, pHeight);
        currentY += pHeight + 10;
      } catch(e) {
        console.warn("Erro ao carregar mapa de palco");
      }
    }

    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }

    if (band.tech_requirements && band.tech_requirements.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Descritivo Técnico", margin, currentY);
      currentY += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      const colWidthRider = (contentWidth / 2) - 5;
      const col1X = margin;
      const col2X = margin + colWidthRider + 10;
      
      let leftY = currentY;
      let rightY = currentY;

      band.tech_requirements.forEach((req, index) => {
        const qtyText = req.qtd ? `${req.qtd}x ` : '';
        const text = `${index + 1}. ${qtyText}${req.item} (${req.provider})`;
        const lines = doc.splitTextToSize(text, colWidthRider);
        
        if (index % 2 === 0) {
          doc.text(lines, col1X, leftY);
          leftY += (lines.length * 5) + 2;
        } else {
          doc.text(lines, col2X, rightY);
          rightY += (lines.length * 5) + 2;
        }
      });
      currentY = Math.max(leftY, rightY) + 10;
    }

    if (currentY > pageHeight - 40 && (band.tech_crew || band.tech_observations)) {
      doc.addPage();
      currentY = margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(band.name.toUpperCase(), margin, currentY);
      currentY += 15;
    }

    if (band.tech_crew) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Equipe Técnica", margin, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const crewLines = doc.splitTextToSize(band.tech_crew, contentWidth);
      doc.text(crewLines, margin, currentY);
      currentY += (crewLines.length * 5) + 10;
    }

    if (band.tech_observations) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Observações", margin, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const obsLines = doc.splitTextToSize(band.tech_observations, contentWidth);
      doc.text(obsLines, margin, currentY);
    }
  }

  doc.save(`PressKit_${band.name.replace(/\s+/g, '_')}.pdf`);
}