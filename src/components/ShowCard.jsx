import React from "react";
import { CalendarDays, MapPin, Clock, Ticket, Share2, Pencil, Trash2, ChevronDown, ChevronUp, Music2, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDateInLocalTimezone } from "@/lib/date";

const formatUrl = (url) => {
  if (!url) return "";
  let cleaned = String(url).replace("https://tgxzkvhqzyxjt.supabase.co", "https://otbjufhtgxzkvhqzyxjt.supabase.co");
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    return `https://otbjufhtgxzkvhqzyxjt.supabase.co/storage/v1/object/public/underground-images/${cleaned}`;
  }
  return cleaned;
};

export default function ShowCard({
  show,
  user,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onShare,
  isCopied,
}) {
  // O criador do evento ou admin pode EDITAR A QUALQUER MOMENTO (Sem limite de tempo!)
  const canEdit =
    user &&
    (show.created_by_id === user.id ||
      user.role === "admin" ||
      user.user_metadata?.role === "admin");

  const formattedDate = getDateInLocalTimezone(show.date).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={`bg-[#121212] border rounded-xl overflow-hidden transition-all ${
      expanded ? "border-[#a8f776] shadow-lg shadow-[#a8f776]/10" : "border-[#1e1e1e] hover:border-[#2a2a2a]"
    }`}>
      {/* CABEÇALHO DO CARD (FECHADO) */}
      <div
        onClick={onToggle}
        className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-[#161616] transition-colors"
      >
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* BLOCO DA DATA */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#181818] border border-[#2a2a2a] flex flex-col items-center justify-center shrink-0 shadow-inner">
            <span className="text-[10px] text-[#a8f776] uppercase font-extrabold tracking-wider">
              {getDateInLocalTimezone(show.date).toLocaleDateString("pt-BR", { month: "short" })}
            </span>
            <span className="text-2xl md:text-3xl font-black text-white leading-none mt-0.5">
              {getDateInLocalTimezone(show.date).getDate()}
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-base md:text-lg truncate">{show.title}</h3>
              
              {/* DESTAQUE DA CIDADE (SOLICITADO) */}
              {show.city && (
                <span className="bg-[#a8f776]/15 border border-[#a8f776]/40 text-[#a8f776] text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1 shrink-0">
                  <MapPin size={11} /> {show.city}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-[#a0a0a0] flex-wrap">
              <span className="capitalize">{formattedDate}</span>
              {show.time && (
                <span className="flex items-center gap-1">
                  • <Clock size={12} className="text-[#a8f776]" /> {show.time}
                </span>
              )}
              {(show.venue_name || show.address) && (
                <span className="truncate">
                  • {show.venue_name || show.address}
                </span>
              )}
            </div>

            {/* BANDAS NO CARD FECHADO */}
            {show.bands && show.bands.length > 0 && (
              <div className="text-xs text-[#707070] truncate pt-0.5">
                Line-up: <span className="text-[#c0c0c0] font-medium">{show.bands.map((b) => b.name).join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTOES DE AÇÃO RÁPIDA NO CABEÇALHO */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="border-[#252525] bg-[#1a1a1a] text-white hover:bg-[#222] text-xs h-8 px-2.5"
          >
            {isCopied ? (
              <Check size={14} className="text-[#a8f776]" />
            ) : (
              <Share2 size={14} className="text-[#a8f776]" />
            )}
          </Button>

          {canEdit && (
            <Button
              onClick={() => onEdit(show)}
              variant="outline"
              size="sm"
              className="border-[#252525] bg-[#1a1a1a] text-white hover:bg-[#222] text-xs h-8 px-2.5"
            >
              <Pencil size={14} className="text-[#a0a0a0]" />
            </Button>
          )}

          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-[#808080] hover:text-white h-8 w-8 p-0"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </div>

      {/* ÁREA EXPANDIDA (NOVO LAYOUT LADO A LADO) */}
      {expanded && (
        <div className="border-t border-[#1a1a1a] bg-[#0d0d0e] p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* LADO ESQUERDO: FLYER DIGITAL */}
            <div className="md:col-span-5 lg:col-span-4">
              {show.flyer_url ? (
                <div className="relative rounded-lg overflow-hidden border border-[#222] bg-black shadow-2xl group">
                  <img
                    src={formatUrl(show.flyer_url)}
                    alt={show.title}
                    className="w-full h-auto max-h-[480px] object-contain mx-auto"
                  />
                  <a
                    href={formatUrl(show.flyer_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Ver imagem completa"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <div className="w-full h-52 bg-[#141414] rounded-lg border border-[#222] flex flex-col items-center justify-center text-[#505050]">
                  <CalendarDays size={36} />
                  <span className="text-xs font-medium mt-2">Sem flyer anexado</span>
                </div>
              )}
            </div>

            {/* LADO DIREITO: TEXTO E DETALHES */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                
                {/* DESTAQUES DE CIDADE & LOCAL */}
                <div className="flex flex-wrap items-center gap-2">
                  {show.city && (
                    <div className="bg-[#a8f776]/15 border border-[#a8f776]/40 text-[#a8f776] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <MapPin size={14} /> CIDADE: {show.city.toUpperCase()}
                    </div>
                  )}
                  {show.venue_name && (
                    <div className="bg-[#181818] border border-[#282828] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                      📍 {show.venue_name}
                    </div>
                  )}
                </div>

                {/* ENDEREÇO COMPLETO */}
                {show.address && (
                  <div className="text-xs text-[#b0b0b0] bg-[#121212] p-3 rounded-lg border border-[#1e1e1e]">
                    <strong className="text-white">Endereço:</strong> {show.address}
                  </div>
                )}

                {/* LINE-UP / BANDAS */}
                {show.bands && show.bands.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#a8f776] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Music2 size={14} /> Line-up Confirmado
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {show.bands.map((b) => (
                        <span
                          key={b.id || b.name}
                          className="bg-[#1a1a1a] border border-[#2e2e2e] text-white text-xs font-semibold px-3 py-1.5 rounded-md"
                        >
                          {b.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* DESCRIÇÃO COMPLETA */}
                {show.description && (
                  <div>
                    <div className="text-xs font-bold text-[#707070] uppercase tracking-wider mb-1.5">
                      Sobre o Evento
                    </div>
                    <div className="text-sm text-[#d0d0d0] leading-relaxed whitespace-pre-wrap bg-[#121212] p-4 rounded-xl border border-[#1e1e1e]">
                      {show.description}
                    </div>
                  </div>
                )}
              </div>

              {/* BARRINHA DE BOTÕES DE AÇÃO NO RODAPÉ DO CARD */}
              <div className="pt-4 border-t border-[#1e1e1e] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {show.ticket_url && (
                    <a
                      href={show.ticket_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Ticket size={15} /> Garantir Ingressos
                    </a>
                  )}

                  <Button
                    onClick={onShare}
                    variant="outline"
                    className="border-[#2e2e2e] bg-[#141414] text-white hover:bg-[#1e1e1e] font-bold text-xs h-9"
                  >
                    <Share2 size={14} className="mr-1.5 text-[#a8f776]" /> Compartilhar Evento
                  </Button>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      onClick={() => onEdit(show)}
                      variant="outline"
                      className="border-[#2e2e2e] bg-[#141414] text-white hover:bg-[#1e1e1e] text-xs h-9"
                    >
                      <Pencil size={14} className="mr-1.5 text-[#a8f776]" /> Editar Show
                    </Button>
                    <Button
                      onClick={() => onDelete(show.id)}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-9"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}