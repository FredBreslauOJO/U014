import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import TagInput from "@/components/TagInput";

const TYPES = [
  ["all", "Todos"],
  ["autoral", "Autoral"],
  ["cover", "Cover"],
  ["ambos", "Ambos"],
];

export default function BandsFilter({ filters, onChange, cities = [], genres = [] }) {
  const [open, setOpen] = useState(false);
  const { type, city, genres: selGenres } = filters;
  const activeCount = (type && type !== "all" ? 1 : 0) + (city ? 1 : 0) + (selGenres?.length || 0);
  const set = (k, v) => onChange({ ...filters, [k]: v });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`bg-[#121212] border-[#222] hover:bg-[#1a1a1a] h-11 ${activeCount ? "border-[#a8f776] text-[#a8f776]" : "text-white"}`}>
          <SlidersHorizontal size={16} className="mr-1" /> Filtros{activeCount ? ` (${activeCount})` : ""}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#121212] border-[#222] text-white p-4 space-y-4" align="end">
        <div>
          <div className="text-xs text-[#b0b0b0] mb-2 font-medium">Tipo de repertório</div>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map(([v, l]) => (
              <button
                key={v}
                onClick={() => set("type", v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  type === v ? "bg-[#a8f776] text-black" : "bg-[#1a1a1a] text-[#909090] border border-[#2a2a2a] hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-[#b0b0b0] mb-2 font-medium">Cidade</div>
          <select value={city} onChange={(e) => set("city", e.target.value)} className="w-full bg-[#0a0a0a] border border-[#222] text-white rounded-md h-9 px-3 text-sm">
            <option value="">Todas</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs text-[#b0b0b0] mb-2 font-medium">Estilos</div>
          <TagInput plain suggestions={genres} value={selGenres || []} onChange={(v) => set("genres", v)} placeholder="Digite o estilo e pressione Enter" />
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="text-[#909090] hover:text-white w-full" onClick={() => onChange({ type: "all", city: "", genres: [] })}>
            <X size={14} className="mr-1" /> Limpar filtros
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}