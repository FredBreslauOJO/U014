import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
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
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/Logo";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/bands", label: "Bandas", icon: Music2 },
  { to: "/admin/shows", label: "Shows", icon: CalendarDays },
  { to: "/admin/venues", label: "Casas de Shows", icon: Building2 },
  { to: "/admin/partners", label: "Guia da Cena", icon: Briefcase },
  { to: "/admin/threads", label: "Threads", icon: MessagesSquare },
  { to: "/admin/news", label: "Notícias", icon: Newspaper },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/venue-reviews", label: "Avaliações", icon: Star },
  { to: "/admin/contact-messages", label: "Contato", icon: Mail },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="h-screen w-screen flex bg-[#0a0a0a] overflow-hidden">
      <aside className="w-[220px] shrink-0 h-full bg-[#0e0e0e] flex flex-col border-r border-[#1a1a1a]">
        <div className="px-4 py-4 shrink-0 flex flex-col items-center gap-1.5">
          <Logo className="h-10 w-auto" />
          <span className="text-sm font-black text-[#a8f776] tracking-widest">ADMIN</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#a0a0a0] hover:text-white hover:bg-[#161616]"
                }`
              }
            >
              <item.icon size={16} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 bg-[#0e0e0e] border-b border-[#1a1a1a] shrink-0">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-[#a0a0a0] hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao site
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#707070] truncate max-w-[220px]">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
