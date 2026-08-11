import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Plus, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/supabase"; // <-- Nossa ponte!
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bandUrl } from "@/lib/slug";
import BandsFilter from "@/components/BandsFilter";

export default function Bands() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bands, setBands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filterCity, setFilterCity] = useState("all");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    setLoading(true);
    // Puxando do Supabase
    supabase.from('bands').select('*').order('created_date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBands(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const cities = useMemo(() => {
    const set = new Set();
    bands.forEach((b) => { if (b.city) set.add(b.city.trim()); });
    return Array.from(set).sort();
  }, [bands]);

  const genresList = useMemo(() => {
    const set = new Set();
    bands.forEach((b) => {
      if (b.genres?.length) b.genres.forEach((g) => set.add(g));
      else if (b.genre) set.add(b.genre);
    });
    return Array.from(set).sort();
  }, [bands]);

  const filteredBands = useMemo(() => {
    return bands.filter((b) => {
      const term = search.toLowerCase();
      const matchesSearch = !term || b.name?.toLowerCase().includes(term) || b.city?.toLowerCase().includes(term) ||
        b.genre?.toLowerCase().includes(term) || b.genres?.some((g) => g.toLowerCase().includes(term));

      const matchesCity = filterCity === "all" || b.city?.trim() === filterCity;
      const matchesGenre = filterGenre === "all" || b.genre === filterGenre || b.genres?.includes(filterGenre);
      const matchesType = filterType === "all" || b.performance_type === filterType;

      return matchesSearch && matchesCity && matchesGenre && matchesType;
    });
  }, [bands, search, filterCity, filterGenre, filterType]);

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">Bandas</h1>
          <p className="text-xs text-[#707070] mt-1">{bands.length} {bands.length === 1 ? "banda cadastrada" : "bandas cadastradas"}</p>
        </div>
        <Button onClick={() => navigate(user ? "/my-band" : "/login")} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold shrink-0">
          <Plus size={16} className="mr-1" /> {user ? "EDITAR MINHA BANDA" : "CADASTRAR BANDA"}
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#606060]" size={18} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, gênero ou cidade..." className="bg-[#121212] border-[#222] text-white pl-11 h-11 focus:border-[#a8f776]" />
        </div>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className={`border-[#222] text-white h-11 gap-2 ${showFilters || filterCity !== "all" || filterGenre !== "all" || filterType !== "all" ? "bg-[#1a1a1a] border-[#a8f776]/50 text-[#a8f776]" : "bg-[#121212] hover:bg-[#1a1a1a]"}`}>
          <SlidersHorizontal size={16} /> Filtros
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6">
          <BandsFilter cities={cities} genres={genresList} selectedCity={filterCity} setSelectedCity={setFilterCity} selectedGenre={filterGenre} setSelectedGenre={setFilterGenre} selectedType={filterType} setSelectedType={setFilterType} onClear={() => { setFilterCity("all"); setFilterGenre("all"); setFilterType("all"); }} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-[#606060]">Carregando bandas...</div>
      ) : filteredBands.length === 0 ? (
        <div className="bg-[#121212] border border-[#1e1e1e] rounded-xl p-12 text-center text-[#707070]">Nenhuma banda encontrada com os filtros selecionados.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBands.map((b) => (
            <Link key={b.id} to={bandUrl(b)} className="group bg-[#121212] hover:bg-[#181818] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl p-3.5 transition-all flex flex-col justify-between">
              <div>
                <div className="aspect-square rounded-lg overflow-hidden bg-[#222] mb-3 flex items-center justify-center border border-[#1a1a1a]">
                  {b.logo_url || b.photo_url ? (
                    <img src={b.logo_url || b.photo_url} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl font-black text-[#444]">{b.name.charAt(0)}</span>
                  )}
                </div>
                <div className="font-bold text-white text-base truncate group-hover:text-[#a8f776] transition-colors">{b.name}</div>
                {b.city && (
                  <div className="text-xs text-[#a8f776] font-medium flex items-center gap-1 mt-1 truncate">
                    <MapPin size={11} className="shrink-0" /> <span className="truncate">{b.city}</span>
                  </div>
                )}
                <div className="text-xs text-[#808080] truncate mt-0.5">{b.genres?.length ? b.genres.join(", ") : b.genre || "—"}</div>
              </div>
              {b.performance_type && (
                <div className="mt-3 pt-2 border-t border-[#1a1a1a]">
                  <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold inline-block ${b.performance_type === "autoral" ? "bg-[#a8f776]/20 text-[#a8f776]" : b.performance_type === "cover" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>{b.performance_type}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}