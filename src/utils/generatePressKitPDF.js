import { jsPDF } from "jspdf";
import { formatUrl } from "@/lib/supabaseStorage";

// Função blindada para converter imagem em Base64 antes de injetar no PDF
const getImageData = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      
      const isPng = url.toLowerCase().includes(".png");
      const format = isPng ? "image/png" : "image/jpeg";
      
      resolve({
        dataUrl: canvas.toDataURL(format),
        width: img.width,
        height: img.height,
        format: isPng ? "PNG" : "JPEG"
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
  
  // 1. Hero Image (topo)
  if (band.photo_url) {
    try {
      const heroImg = await getImageData(formatUrl(band.photo_url));
      const imgRatio = heroImg.width / heroImg.height;
      let printHeight = contentWidth / imgRatio;
      if (printHeight > 70) printHeight = 70; // Limite de altura
      
      doc.addImage(heroImg.dataUrl, heroImg.format, margin, currentY, contentWidth, printHeight);
      currentY += printHeight + 15;
    } catch (e) {
      console.warn("Erro ao carregar hero image.");
    }
  }

  // 2. Logo
  if (band.logo_url) {
    try {
      const logoImg = await getImageData(formatUrl(band.logo_url));
      const logoSize = 30;
      doc.addImage(logoImg.dataUrl, logoImg.format, (pageWidth - logoSize) / 2, currentY - (logoSize / 2), logoSize, logoSize);
      currentY += (logoSize / 2) + 10;
    } catch (e) {
      console.warn("Erro ao carregar logo.");
    }
  }

  // 3. Título e Contato (Centralizados)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const title = band.name.toUpperCase();
  doc.text(title, pageWidth / 2, currentY, { align: "center" });
  currentY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const genre = (band.genre || "Gênero não informado").toUpperCase();
  doc.text(genre, pageWidth / 2, currentY, { align: "center" });
  currentY += 6;

  doc.setFontSize(9);
  const contactInfo = [
    band.city || "",
    band.contact_phone ? `Whatsapp: ${band.contact_phone}` : "",
    band.contact_email ? `Email: ${band.contact_email}` : "",
    band.instagram ? `Insta: ${band.instagram}` : ""
  ].filter(Boolean).join(" | ");
  doc.text(contactInfo, pageWidth / 2, currentY, { align: "center" });
  currentY += 15;

  // 4. Biografia
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

  // 5. Integrantes
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

  // 6. Repertório
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

    const imgWidth = (contentWidth - 5) / 2;
    const imgHeight = imgWidth * 0.66;
    let xOffset = margin;

    for (let i = 0; i < band.gallery.length; i++) {
      if (currentY + imgHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      try {
        const galImg = await getImageData(formatUrl(band.gallery[i]));
        doc.addImage(galImg.dataUrl, galImg.format, xOffset, currentY, imgWidth, imgHeight);
      } catch(e) {
        console.warn("Erro ao carregar imagem da galeria");
      }

      if (i % 2 === 0) {
        xOffset = margin + imgWidth + 5;
      } else {
        xOffset = margin;
        currentY += imgHeight + 5;
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
        if (pHeight > 120) pHeight = 120;
        
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
      
      const colWidth = (contentWidth / 2) - 5;
      const col1X = margin;
      const col2X = margin + colWidth + 10;
      
      let leftY = currentY;
      let rightY = currentY;

      band.tech_requirements.forEach((req, index) => {
        const qtyText = req.qtd ? `${req.qtd}x ` : '';
        const text = `${index + 1}. ${qtyText}${req.item} (${req.provider})`;
        // Quebra a linha de forma inteligente para não vazar a coluna
        const lines = doc.splitTextToSize(text, colWidth);
        
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