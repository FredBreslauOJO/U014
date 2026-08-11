import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react";

export default function FeatureBanner({ banners = [], onSuggest, canSuggest }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div className="relative w-full h-[220px] md:h-[280px] rounded-xl overflow-hidden bg-[#121212] border border-[#222] flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Divulgue aqui na Home!</h3>
        <p className="text-[#808080] text-sm max-w-md mb-4">
          Sugira uma playlist, festival, canal ou novidade da cena underground.
        </p>
        {canSuggest && (
          <button
            onClick={onSuggest}
            className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold px-4 py-2 rounded-md text-sm flex items-center gap-1"
          >
            <Plus size={16} /> Sugerir banner
          </button>
        )}
      </div>
    );
  }

  const banner = banners[current];

  return (
    <div className="relative w-full h-[240px] sm:h-[280px] md:h-[340px] rounded-xl overflow-hidden border border-[#222] bg-[#0d0e0d] group">
      {/* Imagem de Fundo com object-cover para NUNCA distorcer */}
      {banner.image_url ? (
        <img
          src={banner.image_url}
          alt={banner.title || "Banner"}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#181a18] to-[#0a0b0a]" />
      )}

      {/* Sombreamento em gradiente para dar leitura ao texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

      {/* Detalhe da borda verde na esquerda */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#a8f776]" />

      {/* Botão Sugerir */}
      {canSuggest && (
        <button
          onClick={onSuggest}
          className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-md border border-[#333] backdrop-blur-sm flex items-center gap-1 transition-colors z-10"
        >
          <Plus size={14} /> Sugerir
        </button>
      )}

      {/* Textos do Banner */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8 flex flex-col justify-end z-10">
        {banner.subtitle && (
          <span className="text-[11px] font-bold text-[#a8f776] uppercase tracking-widest mb-1.5">
            {banner.subtitle}
          </span>
        )}
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-2 max-w-2xl line-clamp-2">
          {banner.title}
        </h3>
        {banner.description && (
          <p className="text-xs sm:text-sm text-[#d0d0d0] max-w-xl line-clamp-2 leading-relaxed mb-3">
            {banner.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs">
          {banner.author_name && (
            <span className="text-[#808080]">por {banner.author_name}</span>
          )}
          {banner.link_url && (
            <a
              href={banner.link_url}
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-[#a8f776] font-bold flex items-center gap-1 underline transition-colors"
            >
              Abrir <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Navegação entre múltiplos banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 right-4 flex gap-1.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  current === idx ? "w-6 bg-[#a8f776]" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}