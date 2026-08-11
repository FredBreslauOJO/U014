import React, { useState, useRef } from "react";
import { X } from "lucide-react";

export default function TagInput({ suggestions = [], value = [], onChange, placeholder = "Digite e pressione Enter", plain = false }) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const norm = (s) => s.trim().toLowerCase();

  const matches = text.trim()
    ? (plain
        ? suggestions.filter((s) => s.toLowerCase().includes(norm(text)) && !value.includes(s))
        : suggestions.filter((s) => s.name.toLowerCase().includes(norm(text)) && !value.some((v) => v.id && v.id === s.id)))
    : [];

  const addTag = (tag) => {
    if (plain) {
      if (!tag || !tag.trim()) return;
      if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
      onChange([...value, tag.trim()]);
    } else {
      if (!tag || !tag.name || !tag.name.trim()) return;
      if (value.some((v) => v.name.toLowerCase() === tag.name.toLowerCase() && (v.id || null) === (tag.id || null))) return;
      onChange([...value, { id: tag.id || null, name: tag.name.trim() }]);
    }
    setText("");
  };

  const addManual = () => {
    const t = text.trim();
    if (!t) return;
    if (plain) {
      addTag(t);
    } else {
      const match = suggestions.find((s) => s.name.toLowerCase() === t.toLowerCase());
      addTag(match ? { id: match.id, name: match.name } : { id: null, name: t });
    }
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  const onKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addManual(); }
    else if (e.key === "Backspace" && !text && value.length) { remove(value.length - 1); }
    else if ((e.key === "," || e.key === "Tab") && text.trim()) { e.preventDefault(); addManual(); }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] w-full bg-[#0a0a0a] border border-[#222] rounded-md px-2 py-1.5 cursor-text" onClick={() => inputRef.current?.focus()}>
        {value.map((tag, i) => {
          const label = plain ? tag : tag.name;
          const known = plain
            ? suggestions.some((s) => s.toLowerCase() === label.toLowerCase())
            : !!tag.id;
          const tone = plain
            ? (known ? "bg-[#a8f776]/15 text-[#a8f776] border border-[#a8f776]/30" : "bg-[#222] text-white border border-[#333]")
            : (tag.id ? "bg-[#a8f776]/15 text-[#a8f776] border border-[#a8f776]/30" : "bg-orange-500/15 text-orange-400 border border-orange-500/30");
          return (
            <span key={i} className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${tone}`}>
              {label}
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(i); }} className="hover:opacity-70"><X size={11} /></button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={value.length ? "" : placeholder}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-white placeholder:text-[#606060]"
        />
      </div>
      {focused && matches.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-xl max-h-48 overflow-y-auto">
          {matches.slice(0, 10).map((m, idx) => {
            const label = plain ? m : m.name;
            return (
              <button key={idx} type="button" onMouseDown={(e) => { e.preventDefault(); addTag(plain ? m : { id: m.id, name: m.name }); }} className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#222] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a8f776]" /> {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}