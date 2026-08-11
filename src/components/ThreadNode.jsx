import React, { useState } from "react";
import { Trash2, ChevronRight, Reply, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import HeatFlames from "@/components/HeatFlames";
import { collectThreadDates, computeHeat } from "@/lib/threadHeat";

function Avatar({ name }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#a8f776] font-bold text-xs shrink-0">
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function timeStr(d) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ThreadNode({ node, childrenMap, user, onReply, onDelete, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const children = (childrenMap[node.id] || []).slice().sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const canDelete = user && (user.id === node.created_by_id || user.role === "admin");
  const isTopic = depth === 0;
  const heat = isTopic ? computeHeat(collectThreadDates(childrenMap, node.id, node.created_date)) : 0;

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onReply(node.id, text.trim());
      setText("");
      setComposing(false);
      setCollapsed(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={depth > 0 ? "ml-3 md:ml-5 border-l border-[#222] pl-3 md:pl-4" : ""}>
      <div className={`bg-[#121212] border rounded-md p-3 ${isTopic ? "border-[#1e1e1e] border-l-2 border-l-[#a8f776]" : "border-[#1a1a1a]"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar name={node.author_name} />
            <span className="text-xs font-medium text-white truncate">{node.author_name || "Anônimo"}</span>
            {isTopic && <span className="text-[9px] uppercase tracking-wider text-[#a8f776] bg-[#a8f776]/10 px-1.5 py-0.5 rounded">Tópico</span>}
            {heat > 0 && <HeatFlames level={heat} size={14} />}
            <span className="text-[10px] text-[#606060] shrink-0">{timeStr(node.created_date)}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {children.length > 0 && (
              <button onClick={() => setCollapsed((c) => !c)} className="flex items-center gap-1 text-[10px] text-[#707070] hover:text-white px-1.5 py-1 rounded hover:bg-[#1a1a1a] transition-colors">
                <ChevronRight size={12} className={`transition-transform ${collapsed ? "" : "rotate-90"}`} />
                {children.length}
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(node)} className="text-[#404040] hover:text-red-400 p-1 transition-colors">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-[#c0c0c0] mt-2 whitespace-pre-wrap">{node.content}</p>
        {user && (
          <button onClick={() => setComposing((c) => !c)} className="mt-2 text-[11px] text-[#a8f776] hover:underline flex items-center gap-1">
            <Reply size={11} /> Responder
          </button>
        )}
        {composing && user && (
          <div className="flex gap-2 mt-2">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Responde..." className="bg-[#0a0a0a] border-[#222] resize-none flex-1" rows={2} />
            <Button onClick={submit} disabled={sending || !text.trim()} className="bg-[#a8f776] text-black hover:bg-[#8fd862] self-start">
              <Send size={14} />
            </Button>
          </div>
        )}
      </div>
      {!collapsed && children.length > 0 && (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <ThreadNode key={child.id} node={child} childrenMap={childrenMap} user={user} onReply={onReply} onDelete={onDelete} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}