import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Music2,
  CalendarDays,
  Building2,
  Briefcase,
  MessagesSquare,
  Newspaper,
  Image as ImageIcon,
  Star,
  Mail,
  Clock,
} from "lucide-react";
import { supabase } from "@/supabase";

const STAT_CARDS = [
  { table: "profiles", label: "Usuários", to: "/admin/users", icon: Users },
  { table: "bands", label: "Bandas", to: "/admin/bands", icon: Music2 },
  { table: "shows", label: "Shows", to: "/admin/shows", icon: CalendarDays },
  { table: "venues", label: "Casas de Shows", to: "/admin/venues", icon: Building2 },
  { table: "partners", label: "Guia da Cena", to: "/admin/partners", icon: Briefcase },
  { table: "threads", label: "Threads", to: "/admin/threads", icon: MessagesSquare },
  { table: "news", label: "Notícias", to: "/admin/news", icon: Newspaper },
  { table: "banners", label: "Banners", to: "/admin/banners", icon: ImageIcon },
  { table: "venue_reviews", label: "Avaliações", to: "/admin/venue-reviews", icon: Star },
  { table: "contact_messages", label: "Mensagens de Contato", to: "/admin/contact-messages", icon: Mail },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [pendingBanners, setPendingBanners] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      STAT_CARDS.map(({ table }) =>
        supabase.from(table).select("*", { count: "exact", head: true }).then(({ count }) => [table, count || 0])
      )
    ).then((entries) => {
      setCounts(Object.fromEntries(entries));
      setLoading(false);
    });

    supabase
      .from("banners")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setPendingBanners(count || 0));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Dashboard</h1>

      {pendingBanners > 0 && (
        <Link
          to="/admin/banners"
          className="mb-6 flex items-center gap-3 bg-[#a8f776]/10 border border-[#a8f776]/30 rounded-lg p-4 hover:bg-[#a8f776]/15 transition-colors"
        >
          <Clock size={18} className="text-[#a8f776]" />
          <span className="text-sm text-white font-medium">
            {pendingBanners} {pendingBanners === 1 ? "banner pendente" : "banners pendentes"} de aprovação
          </span>
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ table, label, to, icon: Icon }) => (
          <Link
            key={table}
            to={to}
            className="bg-[#121212] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#2a2a2a] hover:bg-[#161616] transition-colors"
          >
            <Icon size={20} className="text-[#a8f776] mb-3" />
            <div className="text-2xl font-black text-white">{loading ? "—" : counts[table]}</div>
            <div className="text-xs text-[#808080] mt-1">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
