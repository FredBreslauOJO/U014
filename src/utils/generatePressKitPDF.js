const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export async function generatePressKitPDF(band, tracks = []) {
  try {
    await Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
    ]);

    const { jsPDF } = window.jspdf;
    const logoOrPhoto = band.logo_url || band.photo_url;
    const headerBg = band.photo_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200";
    const gallery = band.gallery || [];

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0";
    wrapper.style.width = "800px";

    // PÁGINA 1
    const page1 = document.createElement("div");
    page1.style.cssText = `
      width: 800px;
      height: 1131px;
      background-color: #0d0d0d;
      color: #ffffff;
      padding: 40px;
      box-sizing: border-box;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    page1.innerHTML = `
      <div>
        <div style="position: relative; height: 260px; border-radius: 12px; overflow: hidden; margin-bottom: 24px; border: 1px solid #222;">
          <img src="${headerBg}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, #0d0d0d 15%, rgba(13,13,13,0.5) 70%, transparent);"></div>
          
          <div style="position: absolute; bottom: 20px; left: 24px; right: 24px; display: flex; align-items: flex-end; gap: 20px;">
            ${logoOrPhoto ? `<img src="${logoOrPhoto}" style="width: 90px; height: 90px; border-radius: 8px; object-fit: cover; border: 2px solid #a8f776; background: #111;" />` : ''}
            <div>
              <div style="font-size: 11px; font-weight: bold; color: #a8f776; letter-spacing: 2px; text-transform: uppercase;">Press Kit Oficial</div>
              <h1 style="font-size: 34px; font-weight: 900; margin: 2px 0; color: #ffffff;">${band.name}</h1>
              <div style="font-size: 13px; color: #cccccc; font-weight: 500;">
                ${band.city ? `📍 ${band.city}` : ''} 
                ${(band.genres?.length ? band.genres.join(", ") : band.genre) ? ` • ${(band.genres?.length ? band.genres.join(", ") : band.genre)}` : ''}
                ${band.performance_type ? ` • <span style="color:#a8f776; text-transform:uppercase; font-weight:bold;">${band.performance_type}</span>` : ''}
              </div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px;">
          <div style="background: #141414; padding: 12px 16px; border-radius: 8px; border: 1px solid #222;">
            <div style="font-size: 10px; color: #707070; text-transform: uppercase; font-weight: bold;">Produção</div>
            <div style="font-size: 13px; font-weight: bold; color: #fff; margin-top: 3px;">${band.contact_person || band.name}</div>
          </div>
          <div style="background: #141414; padding: 12px 16px; border-radius: 8px; border: 1px solid #222;">
            <div style="font-size: 10px; color: #707070; text-transform: uppercase; font-weight: bold;">Duração do Show</div>
            <div style="font-size: 13px; font-weight: bold; color: #a8f776; margin-top: 3px;">${band.show_duration || "60 minutos"}</div>
          </div>
          <div style="background: #141414; padding: 12px 16px; border-radius: 8px; border: 1px solid #222;">
            <div style="font-size: 10px; color: #707070; text-transform: uppercase; font-weight: bold;">WhatsApp / Contato</div>
            <div style="font-size: 13px; font-weight: bold; color: #fff; margin-top: 3px;">${band.whatsapp || "—"}</div>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 14px; font-weight: 800; color: #a8f776; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;">SOBRE A BANDA</h2>
          <div style="font-size: 12px; color: #d0d0d0; line-height: 1.65; text-align: justify;">${band.bio || "Nenhum release cadastrado."}</div>
        </div>

        ${band.members ? `
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 14px; font-weight: 800; color: #a8f776; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;">INTEGRANTES</h2>
            <div style="font-size: 12px; color: #d0d0d0; line-height: 1.5;">${band.members}</div>
          </div>
        ` : ''}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #222; padding-top: 14px; font-size: 10px; color: #606060;">
        <span>${band.name} • Press Kit</span>
        <span>Página 1 de 2</span>
      </div>
    `;

    // PÁGINA 2
    const page2 = document.createElement("div");
    page2.style.cssText = `
      width: 800px;
      height: 1131px;
      background-color: #0d0d0d;
      color: #ffffff;
      padding: 40px;
      box-sizing: border-box;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `;

    page2.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #a8f776; padding-bottom: 12px; margin-bottom: 24px;">
          <div>
            <h2 style="font-size: 20px; font-weight: 900; color: #fff; margin: 0;">${band.name}</h2>
            <span style="font-size: 11px; color: #a8f776; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Especificações Técnicas & Mídia</span>
          </div>
          <div style="font-size: 11px; color: #808080; text-align: right;">
            ${band.email ? `<div>${band.email}</div>` : ''}
            ${band.instagram ? `<div>${band.instagram}</div>` : ''}
          </div>
        </div>

        <!-- Rider Técnico & Input List -->
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 13px; font-weight: 800; color: #a8f776; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;">RIDER TÉCNICO & INPUT LIST</h3>
          <div style="background: #121212; padding: 14px; border-radius: 8px; border: 1px solid #222; font-size: 11px; color: #d0d0d0; line-height: 1.5; font-family: Monaco, Consolas, monospace; white-space: pre-wrap;">${band.rider_notes || "Consulte a produção para especificações detalhadas de som."}</div>
        </div>

        <!-- DIAGRAMAÇÃO DA GALERIA DE FOTOS -->
        ${gallery.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: 800; color: #a8f776; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 12px; letter-spacing: 1px; text-transform: uppercase;">GALERIA DE FOTOS / DIVULGAÇÃO</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              ${gallery.slice(0, 6).map((imgUrl) => `
                <div style="height: 130px; border-radius: 6px; overflow: hidden; border: 1px solid #222; background: #111;">
                  <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <!-- Músicas -->
        ${tracks.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: 800; color: #a8f776; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;">MÚSICAS & REPERTÓRIO</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              ${tracks.slice(0, 6).map((t, i) => `
                <div style="background: #141414; padding: 8px 12px; border-radius: 6px; border: 1px solid #222;">
                  <div style="font-size: 11px; font-weight: bold; color: #fff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${i + 1}. ${t.title}</div>
                  <div style="font-size: 10px; color: #a8f776;">${t.source || "Link"}</div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ''}

        <!-- Mapa de Palco (se houver) -->
        ${band.stage_map_url ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 13px; font-weight: 800; color: #a8f776; border-bottom: 1px solid #222; padding-bottom: 6px; margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;">MAPA DE PALCO</h3>
            <div style="border-radius: 8px; overflow: hidden; border: 1px solid #222; background: #000; text-align: center; padding: 8px;">
              <img src="${band.stage_map_url}" style="max-width: 100%; max-height: 180px; object-fit: contain;" />
            </div>
          </div>
        ` : ''}
      </div>

      <div>
        <div style="background: #121212; border: 1px solid #222; border-left: 3px solid #a8f776; padding: 14px; border-radius: 8px; margin-bottom: 14px;">
          <div style="font-size: 10px; font-weight: 900; color: #a8f776; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;">
            UNDERGROUND 014 • CIRCUITO INDEPENDENTE
          </div>
          <p style="font-size: 11px; color: #b0b0b0; font-style: italic; margin: 0; line-height: 1.4;">
            "A cultura underground não espera permissão. Criamos nossos próprios palcos, amplificamos nosso próprio som e fortalecemos a cena com as próprias mãos. Orgulhosamente independentes, engajados e DIY na veia."
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #222; padding-top: 14px; font-size: 10px; color: #606060;">
          <span>Gerado via Underground 014</span>
          <span>Página 2 de 2</span>
        </div>
      </div>
    `;

    wrapper.appendChild(page1);
    wrapper.appendChild(page2);
    document.body.appendChild(wrapper);

    const canvas1 = await window.html2canvas(page1, { scale: 2, useCORS: true, backgroundColor: "#0d0d0d" });
    const canvas2 = await window.html2canvas(page2, { scale: 2, useCORS: true, backgroundColor: "#0d0d0d" });

    document.body.removeChild(wrapper);

    // Criação do PDF em formato exatamente 800x1131 px (Full Bleed sem margens laterais)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [800, 1131]
    });

    pdf.addImage(canvas1.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 800, 1131);
    pdf.addPage([800, 1131], "portrait");
    pdf.addImage(canvas2.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 800, 1131);

    const fileName = `PressKit_${band.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Erro ao gerar Press Kit PDF:", error);
    alert("Erro ao gerar PDF.");
    return false;
  }
}