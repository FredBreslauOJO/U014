import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Flame, ChevronRight, Briefcase } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { usePlayer } from "@/lib/playerContext";
import FeatureBanner from "@/components/home/FeatureBanner";
import BannerSubmit from "@/components/home/BannerSubmit";
import BannerAdmin from "@/components/home/BannerAdmin";
import Logo from "@/components/Logo";
import { bandUrl } from "@/lib/slug";

// Helper para formatar e normalizar URLs de imagens
const formatUrl = (url) => {
  if (!url) return "";
  let cleaned = String(url).replace("https://tgxzkvhqzyxjt.supabase.co", "https://otbjufhtgxzkvhqzyxjt.supabase.co");
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    return `https://otbjufhtgxzkvhqzyxjt.supabase.co/storage/v1/object/public/underground-images/${cleaned}`;
  }
  return cleaned;
};

export default function Home() {
  const [bands, setBands] = useState([]);
  const [news, setNews] = useState([]);
  const [shows, setShows] = useState([]);
  const [partners, setPartners] = useState([]);
  const [banners, setBanners] = useState([]);
  const [pending, setPending] = useState([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const isAdmin = user?.role === "admin" || user?.user_metadata?.role === "admin";

  useEffect(() => {
    supabase.from("bands").select("*").order("created_date", { ascending: false }).limit(50).then(({ data }) => data && setBands(data));
    supabase.from("news").select("*").order("created_date", { ascending: false }).limit(8).then(({ data }) => data && setNews(data));
    supabase.from("shows").select("*").order("created_date", { ascending: false }).limit(10).then(({ data }) => data && setShows(data));
    supabase.from("partners").select("*").order("created_date", { ascending: false }).limit(6).then(({ data }) => data && setPartners(data));
    supabase.from("banners").select("*").order("created_date", { ascending: false }).limit(20).then(({ data }) => data && setBanners(data));
  }, []);

  useEffect(() => {
    if (isAdmin) {
      supabase.from("banners").select("*").eq("status", "pending").then(({ data }) => data && setPending(data));
    }
  }, [user, isAdmin]);

  const featuredBands = useMemo(() => {
    const shuffled = [...bands].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [bands]);

  const submitBanner = async (form) => {
    const { data: created, error } = await supabase.from("banners").insert([{
      ...form,
      status: "pending",
      author_name: user?.user_metadata?.full_name || user?.email || "Anônimo",
      created_by_id: user?.id
    }]).select().single();

    if (!error && created && isAdmin) {
      setPending((p) => [created, ...p]);
    }
  };

  const approveBanner = async (b) => {
    await supabase.from("banners").update({ status: "approved" }).eq("id", b.id);
    setPending((p) => p.filter((x) => x.id !== b.id));
    setBanners((bs) => [{ ...b, status: "approved" }, ...bs]);
  };

  const rejectBanner = async (b) => {
    await supabase.from("banners").update({ status: "rejected" }).eq("id", b.id);
    setPending((p) => p.filter((x) => x.id !== b.id));
  };

  return (
    <div className="relative px-4 md:px-8 py-6 max-w-[1400px] mx-auto overflow-hidden">
      <style>{`
        @keyframes organicGlow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 0.35;
          }
          50% {
            transform: translate(-48%, -52%) scale(1.15) rotate(6deg);
            opacity: 0.60;
          }
        }
        .animate-organic-glow {
          animation: organicGlow 10s ease-in-out infinite;
        }
      `}</style>

      {/* Glow Suave sem corte seco */}
      <div 
        className="
          absolute
          top-[280px] sm:top-[320px]
          left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[500px] sm:w-[750px] md:w-[950px]
          h-[350px] sm:h-[500px] md:h-[600px]
          bg-gradient-to-b
          from-[#a8f776]/30
          via-[#2e7d15]/20
          to-transparent
          rounded-full
          blur-[80px] md:blur-[130px]
          pointer-events-none
          animate-organic-glow
          z-0
        " 
      />

      <div className="relative z-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo className="h-36 md:h-52 w-auto mb-6" />
          <p className="text-[#909090] text-sm md:text-base max-w-2xl leading-relaxed">
            A plataforma da cena underground local. <br />
            Promova seu material, encontre parcerias, divulgue shows e junte a galera.
          </p>
        </div>

        {/* Banner Principal */}
        <section className="mb-10">
          {isAdmin && <BannerAdmin pending={pending} onApprove={approveBanner} onReject={rejectBanner} />}
          <FeatureBanner
            banners={banners.filter((b) => b.status === "approved")}
            onSuggest={() => setSubmitOpen(true)}
            canSuggest={!!user}
          />
          <BannerSubmit open={submitOpen} onClose={() => setSubmitOpen(false)} onSubmit={submitBanner} />
        </section>

        {/* Bandas em Destaque */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-[#a8f776]" />
              <h2 className="text-xl font-bold text-white">Bandas em destaque</h2>
            </div>
            <Link to="/bands" className="text-xs text-[#a0a0a0] hover:text-white flex items-center gap-1">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredBands.map((b) => (
              <Link
                key={b.id}
                to={bandUrl(b)}
                className="group bg-[#121212] hover:bg-[#181818] border border-[#1e1e1e] rounded-lg p-4 transition-colors"
              >
                <div className="aspect-square rounded-md overflow-hidden bg-[#222] mb-3 flex items-center justify-center">
                  {b.logo_url || b.photo_url ? (
                    <img 
                      src={formatUrl(b.logo_url || b.photo_url)} 
                      alt={b.name} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <span className="text-3xl font-black text-[#444]">{b.name.charAt(0)}</span>
                  )}
                </div>
                <div className="font-semibold text-white text-sm truncate">{b.name}</div>
                <div className="text-xs text-[#808080] truncate">{b.genre || b.city || "—"}</div>
              </Link>
            ))}
            {featuredBands.length === 0 && (
              <p className="text-[#505050] text-sm col-span-full">Nenhuma banda cadastrada ainda.</p>
            )}
          </div>
        </section>

        {/* Próximos Shows */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-[#a8f776]" />
              <h2 className="text-xl font-bold text-white">Próximos shows</h2>
            </div>
            <Link to="/shows" className="text-xs text-[#a0a0a0] hover:text-white flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shows.slice(0, 6).map((s) => (
              <Link key={s.id} to={`/shows?show=${s.id}`} className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-4 hover:bg-[#181818] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded bg-[#1a1a1a] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-[#707070] uppercase">{new Date(s.date).toLocaleDateString("pt-BR", { month: "short" })}</span>
                    <span className="text-lg font-bold text-white">{new Date(s.date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{s.title}</div>
                    <div className="text-xs text-[#909090] truncate">{(s.bands?.map((b) => b.name).join(", ")) || s.band_name || "—"}</div>
                    <div className="text-xs text-[#606060] flex items-center gap-1 mt-1">
                      <MapPin size={11} /> {(s.venues?.map((v) => v.name).join(", ")) || s.venue_name || s.city || s.time || ""}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {shows.length === 0 && <p className="text-[#505050] text-sm col-span-full">Nenhum show agendado.</p>}
          </div>
        </section>

        {/* Guia da Cena & Serviços */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-[#a8f776]" />
              <h2 className="text-xl font-bold text-white">Guia da Cena & Serviços</h2>
            </div>
            <Link to="/partners" className="text-xs text-[#a0a0a0] hover:text-white flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {partners.slice(0, 6).map((p) => (
              <Link key={p.id} to="/partners" className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-3 hover:bg-[#181818] transition-colors flex items-center gap-3">
                {p.photo_url ? (
                  <img 
                    src={formatUrl(p.photo_url)} 
                    alt={p.name} 
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 rounded-lg object-cover bg-[#222] shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#a8f776] font-bold text-base shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white text-sm truncate">{p.name}</div>
                  <div className="text-xs text-[#a8f776] font-medium">{p.category}</div>
                  <div className="text-xs text-[#707070] truncate">{p.specialties || p.city || "—"}</div>
                </div>
              </Link>
            ))}
            {partners.length === 0 && (
              <p className="text-[#505050] text-sm col-span-full">Nenhum profissional cadastrado ainda.</p>
            )}
          </div>
        </section>

        {/* Notícias */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Notícias</h2>
            </div>
            <Link to="/news" className="text-xs text-[#a0a0a0] hover:text-white flex items-center gap-1">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {news.slice(0, 4).map((n) => (
              <Link key={n.id} to="/news" className="bg-[#121212] border border-[#1e1e1e] rounded-lg overflow-hidden hover:bg-[#181818] transition-colors flex">
                {n.image_url && (
                  <img 
                    src={formatUrl(n.image_url)} 
                    alt={n.title} 
                    loading="lazy"
                    decoding="async"
                    className="w-24 h-24 object-cover shrink-0" 
                  />
                )}
                <div className="p-3">
                  <div className="text-[10px] text-[#a8f776] uppercase tracking-wider">{n.category}</div>
                  <div className="font-semibold text-white text-sm mt-1">{n.title}</div>
                  <div className="text-xs text-[#808080] mt-1 line-clamp-2">{n.content}</div>
                </div>
              </Link>
            ))}
            {news.length === 0 && <p className="text-[#505050] text-sm col-span-full">Nenhuma notícia ainda.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}