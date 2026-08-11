import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PlayerBar from "@/components/PlayerBar";
import { PlayerProvider } from "@/lib/playerContext";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <PlayerProvider>
      <div className="h-screen w-screen flex bg-[#0a0a0a] overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white z-10"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0e0e0e] border-b border-[#1a1a1a]">
            <button onClick={() => setMobileOpen(true)} className="text-white">
              <Menu size={22} />
            </button>
            <span className="text-sm font-bold text-[#a8f776] tracking-widest">014</span>
            <div className="w-6" />
          </div>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>

          <PlayerBar />
        </div>
      </div>
    </PlayerProvider>
  );
}