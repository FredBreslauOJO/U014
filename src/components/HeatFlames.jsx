import React from "react";
import { Flame } from "lucide-react";

const COLORS = { 1: "#ef4444", 2: "#ef4444", 3: "#ef4444" };
const LABELS = { 1: "Ativo — interação nos últimos dias", 2: "Movimentado — interação diária", 3: "Debate ativo — muita resposta" };

export default function HeatFlames({ level, size = 12 }) {
  if (!level) return null;
  const color = COLORS[level] || "#4d6641";
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0" title={LABELS[level]}>
      {Array.from({ length: level }).map((_, i) => (
        <Flame key={i} size={size} style={{ color }} className="fill-current" />
      ))}
    </span>
  );
}