import React from "react";
import { Check, X, Clock } from "lucide-react";

export default function BannerAdmin({ pending, onApprove, onReject }) {
  if (!pending.length) return null;
  return (
    <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={15} className="text-[#f2994a]" />
        <h3 className="text-sm font-bold text-white">Chamadas pendentes</h3>
        <span className="text-xs text-[#707070]">{pending.length}</span>
      </div>
      <div className="space-y-2">
        {pending.map((b) => (
          <div key={b.id} className="flex items-center gap-3 bg-[#0e0e0e] border border-[#1a1a1a] rounded-md p-2.5">
            {b.image_url ? (
              <img src={b.image_url} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded bg-[#222] shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white font-medium truncate">{b.title}</div>
              <div className="text-xs text-[#707070] truncate">{b.subtitle || b.category || "—"} · por {b.author_name || "—"}</div>
            </div>
            <button onClick={() => onApprove(b)} className="w-8 h-8 rounded-md bg-[#a8f776]/10 hover:bg-[#a8f776]/20 flex items-center justify-center text-[#a8f776] transition-colors" title="Aprovar">
              <Check size={16} />
            </button>
            <button onClick={() => onReject(b)} className="w-8 h-8 rounded-md bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors" title="Rejeitar">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}