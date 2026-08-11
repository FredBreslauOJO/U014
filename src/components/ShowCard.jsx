import React from "react";
import { MapPin, Clock, ExternalLink, Trash2, Pencil, ChevronDown, Calendar, Music2 } from "lucide-react";

const bandNames = (s) => (s.bands?.map((b) => b.name).filter(Boolean).join(", ")) || s.band_name || "";
const venueNames = (s) => (s.venues?.map((v) => v.name).filter(Boolean).join(", ")) || s.venue_name || "";

const getLocationString = (s) => {
  const v = venueNames(s);
  const parts = [v, s.address, s.city].filter(Boolean);
  return parts.join(" — ");
};

const parseLocalDate = (d) => {
  if (!d) return new Date();
  if (typeof d === "string" && d.includes("-") && !d.includes("T")) {
    const [year, month, day] = d.split("T")[0].split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(d);
};

const formatDate = (d) => {
  try {
    const dateObj = parseLocalDate(d);
    return dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return d; }
};

// Extrator de estilos (Puxa do array ou da String que salvamos para burlar o banco)
const getShowGenres = (s) => {
  const set = new Set();
  if (s.genres && Array.isArray(s.genres)) s.genres.forEach(g => set.add(g.trim()));
  if (s.genre && typeof s.genre === "string") s.genre.split(",").forEach(g => set.add(g.trim()));
  
  if (s.bands && Array.isArray(s.bands)) {
    s.bands.forEach(b => {
      if (b.genre) set.add(b.genre.trim());
      if (b.genres && Array.isArray(b.genres)) b.genres.forEach(g => set.add(g.trim()));
    });
  }
  return Array.from(set).filter(Boolean).sort();
};

export default function ShowCard({ show, user, variant = "upcoming", expanded, onToggle, onEdit, onDelete }) {
  const isOwner = user && show.created_by_id === user.id;
  const dateObj = parseLocalDate(show.date);
  const dateLabel = dateObj.toLocaleDateString("pt-BR", { month: "short" });
  const day = dateObj.getDate();
  
  const thumbSize = variant === "upcoming" ? "w-16 h-16 md:w-20 md:h-20" : "w-14 h-14";
  const isPast = variant === "past";
  const location = getLocationString(show);
  const showGenres = getShowGenres(show);

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isPast ? "bg-[#161616] border-[#262626] hover:border-[#333] opacity-80 hover:opacity-100" : "bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]"
      }`}
    >
      <div className="p-3 md:p-4 flex items-start gap-4 cursor-pointer" onClick={onToggle}>
        {show.flyer_url ? (
          <div className={`${thumbSize} rounded-md overflow-hidden shrink-0`}>
            <img src={show.flyer_url} alt="flyer" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`${thumbSize} rounded bg-[#222] flex flex-col items-center justify-center shrink-0`}>
            <span className="text-[10px] text-[#909090] uppercase">{dateLabel}</span>
            <span className={`font-black text-white ${isPast ? "text-base" : "text-2xl"}`}>{day}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-white ${isPast ? "text-sm" : "text-base"}`}>{show.title}</div>

          {/* Tags de Estilos */}
          {showGenres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 mb-2">
              {showGenres.map((g, idx) => (
                <span key={idx} className="bg-[#222] border border-[#333] text-[#a0a0a0] text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold flex items-center gap-1">
                  <Music2 size={10} className="text-[#a8f776]" /> {g}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-[#909090]">
            <span className="flex items-center gap-1"><Calendar size={12} className="text-[#a8f776]" /> {formatDate(show.date)}</span>
            {show.time && <span className="flex items-center gap-1"><Clock size={12} /> {show.time}</span>}
            
            {location && (
              <span className="flex items-center gap-1 text-white/90 font-medium bg-[#222] px-2 py-0.5 rounded border border-[#333]">
                <MapPin size={12} className="text-[#a8f776] shrink-0" /> {location}
              </span>
            )}
          </div>

          {show.description ? (
            <p className="text-xs text-[#707070] mt-2 line-clamp-2">{show.description}</p>
          ) : (
            <p className="text-xs text-[#505050] mt-2 italic line-clamp-1">{bandNames(show) || "Sem descrição"}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 shrink-0 self-center">
          {show.ticket_url && (
            <a href={show.ticket_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[#a8f776] hover:opacity-80">
              <ExternalLink size={16} />
            </a>
          )}
          <ChevronDown size={16} className={`text-[#606060] transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-[#2a2a2a] mt-1 space-y-3">
          {show.flyer_url && (
            <img src={show.flyer_url} alt="flyer" className="w-full max-h-80 object-contain rounded-md bg-[#0a0a0a]" />
          )}
          {location && (
            <div className="text-xs text-[#a8f776] font-medium flex items-center gap-1.5 bg-[#121212] p-2 rounded border border-[#222]">
              <MapPin size={14} className="shrink-0" /> Local: {location}
            </div>
          )}
          {show.description ? (
            <p className="text-sm text-[#c0c0c0] whitespace-pre-wrap">{show.description}</p>
          ) : (
            <p className="text-xs text-[#606060] italic">Sem descrição.</p>
          )}
          <div className="flex items-center gap-4 pt-1">
            {show.ticket_url && (
              <a href={show.ticket_url} target="_blank" rel="noreferrer" className="text-xs text-[#a8f776] underline flex items-center gap-1">
                <ExternalLink size={12} /> Ingressos
              </a>
            )}
            {isOwner && (
              <div className="flex items-center gap-4 ml-auto">
                <button onClick={(e) => { e.stopPropagation(); onEdit(show); }} className="text-xs text-[#909090] hover:text-white flex items-center gap-1">
                  <Pencil size={12} /> Editar
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(show.id); }} className="text-xs text-[#606060] hover:text-red-400 flex items-center gap-1">
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}