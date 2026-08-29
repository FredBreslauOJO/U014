import { jsPDF } from "jspdf";
import { formatUrl } from "@/lib/supabaseStorage";

// Função auxiliar para carregar imagens e evitar distorção
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

export async function generatePressKitPDF(band) {
  // Cria um documento A4 (210x297mm)
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  
  let currentY = margin;

  // --- PÁGINA 1: INFORMAÇÕES E BIO ---
  
  // 1. Hero Image (topo)
  if (band.hero_url) {
    try {
      const heroImg = await loadImage(formatUrl(band.hero_url));
      // Calcula proporção para não esticar (altura máxima de 70mm)
      const imgRatio = heroImg.width / heroImg.height;
      let printHeight = contentWidth / imgRatio;
      if (printHeight > 70) printHeight = 70; 
      
      doc.addImage(heroImg, "JPEG", margin, currentY, contentWidth, printHeight);
      currentY += printHeight + 15;
    } catch (e) {
      console.warn("Erro ao carregar hero image pro PDF");
    }
  }

  // 2. Logo e Título
  if (band.logo_url) {
    try {
      const logoImg = await loadImage(formatUrl(band.logo_url));
      doc.addImage(logoImg, "PNG", margin, currentY, 25, 25);
    } catch (e) {}
  }

  const textX = band.logo_url ? margin + 30 : margin;
  let titleY = currentY + 10;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(band.name.toUpperCase(), textX, titleY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text((band.genre || "Gênero não informado").toUpperCase(), textX, titleY + 6);
  
  doc.setFontSize(9);
  doc.text([
    `${band.city || ""}`,
    band.contact_email ? `Email: ${band.contact_email}` : "",
    band.contact_phone ? `Whatsapp: ${band.contact_phone}` : "",
    band.instagram ? `Instagram: ${band.instagram}` : ""
  ].filter(Boolean).join(" | "), textX, titleY + 12);

  currentY = Math.max(currentY + 25, titleY + 20) + 10;

  // 3. Biografia
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Biografia", margin, currentY);
  currentY += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const bioLines = doc.splitTextToSize(band.bio || "Biografia não informada.", contentWidth);
  doc.text(bioLines, margin, currentY);
  currentY += (bioLines.length * 5) + 10;

  // 4. Integrantes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Integrantes", margin, currentY);
  currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const memberLines = doc.splitTextToSize(band.members || "Não informado.", contentWidth);
  doc.text(memberLines, margin, currentY);
  currentY += (memberLines.length * 5) + 10;

  // 5. Repertório (Opcional)
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

  // --- PÁGINA 2: GALERIA DE FOTOS ---
  if (band.gallery_urls && band.gallery_urls.length > 0) {
    doc.addPage();
    currentY = margin;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(band.name.toUpperCase(), margin, currentY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("GALERIA DE FOTOS", margin, currentY + 6);
    currentY += 15;

    // Grid simples de 2 colunas para galeria
    const imgWidth = (contentWidth - 5) / 2;
    const imgHeight = imgWidth * 0.66; // Proporção 3:2
    let xOffset = margin;

    for (let i = 0; i < band.gallery_urls.length; i++) {
      if (currentY + imgHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      try {
        const galImg = await loadImage(formatUrl(band.gallery_urls[i]));
        doc.addImage(galImg, "JPEG", xOffset, currentY, imgWidth, imgHeight);
      } catch(e) {}

      if (i % 2 === 0) {
        xOffset = margin + imgWidth + 5;
      } else {
        xOffset = margin;
        currentY += imgHeight + 5;
      }
    }
  }

  // --- PÁGINA 3: RIDER TÉCNICO ---
  // Só cria essa página se tiver alguma info técnica
  if (band.stage_plot_url || (band.tech_requirements && band.tech_requirements.length > 0) || band.tech_crew || band.tech_observations) {
    doc.addPage();
    currentY = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(band.name.toUpperCase(), margin, currentY);
    doc.setFontSize(12);
    doc.text("RIDER TÉCNICO", margin, currentY + 6);
    currentY += 15;

    // 1. Mapa de Palco (Stage Plot)
    if (band.stage_plot_url) {
      try {
        const plotImg = await loadImage(formatUrl(band.stage_plot_url));
        const plotRatio = plotImg.width / plotImg.height;
        let pHeight = contentWidth / plotRatio;
        if (pHeight > 100) pHeight = 100; // Limita a altura para caber o resto
        
        doc.addImage(plotImg, "JPEG", margin, currentY, contentWidth, pHeight);
        currentY += pHeight + 10;
      } catch(e) {}
    }

    // Verifica quebra de página
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }

    // 2. Descritivo (Input List / Backline)
    if (band.tech_requirements && band.tech_requirements.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Descritivo Técnico", margin, currentY);
      currentY += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Divide em 2 colunas para economizar espaço
      const col1X = margin;
      const col2X = margin + (contentWidth / 2);
      let listY = currentY;

      band.tech_requirements.forEach((req, index) => {
        const xPos = index % 2 === 0 ? col1X : col2X;
        const text = `${index + 1}. ${req.item} (${req.provider})`;
        doc.text(text, xPos, listY);
        
        if (index % 2 !== 0) {
          listY += 6;
        }
      });
      
      currentY = listY + (band.tech_requirements.length % 2 !== 0 ? 6 : 0) + 10;
    }

    // 3. Equipe Técnica e Observações (Página 4 se não couber)
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

  // Baixa o arquivo
  doc.save(`PressKit_${band.name.replace(/\s+/g, '_')}.pdf`);
}