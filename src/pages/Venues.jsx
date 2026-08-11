import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus, MapPin, Users, Trash2, Instagram, ChevronRight } from "lucide-react";
import { supabase } from "@/supabase"; // <-- Nossa nova ponte
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import StarRating from "@/components/StarRating";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function Venues() {
  const { toast } = useToast();
  const [venues, setVenues] = useState([]);
  const [reviews, setReviews] = useState([]);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", capacity: "", contact: "", instagram: "", description: "" });

  const load = async () => {
    const [
      { data: v },
      { data: r }
    ] = await Promise.all([
      supabase.from('venues').select('*').order('created_date', { ascending: false }),
      supabase.from('venue_reviews').select('*')
    ]);
    
    setVenues(v || []);
    setReviews(r || []);
  };

  useEffect(() => { load(); }, []);

  const ratingFor = (vid) => {
    const rs = reviews.filter((x) => x.venue_id === vid);
    if (!rs.length) return { avg: 0, count: 0 };
    return { avg: rs.reduce((s, x) => s + (x.rating || 0), 0) / rs.length, count: rs.length };
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const create = async () => {
    if (!form.name.trim()) { toast({ title: "Informe o nome", variant: "destructive" }); return; }
    
    const payload = {
      ...form,
      capacity: form.capacity ? String(form.capacity) : null, // Salvando como texto para não dar erro
      created_by_id: user?.id
    };

    const { error } = await supabase.from('venues').insert([payload]);
    if (error) { toast({ title: "Erro ao cadastrar", variant: "destructive" }); return; }

    toast({ title: "Casa de shows cadastrada!" });
    setForm({ name: "", address: "", city: "", capacity: "", contact: "", instagram: "", description: "" });
    setOpen(false);
    load();
  };

  const remove = async (id) => {
    await supabase.from('venues').delete().eq('id', id);
    setVenues(venues.filter((v) => v.id !== id));
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2"><Building2 className="text-[#a8f776]" /> Casas de Shows</h1>
          <p className="text-[#808080] text-sm mt-1">{venues.length} locais cadastrados</p>
        </div>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#a8f776] text-black hover:bg-[#8fd862]"><Plus size={16} className="mr-1" /> Cadastrar casa</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-[#222] text-white max-w-lg">
              <DialogHeader><DialogTitle className="text-white">Cadastrar casa de shows</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-[#b0b0b0]">Nome *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="bg-[#0a0a0a] border-[#222]" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-[#b0b0b0]">Endereço</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} className="bg-[#0a0a0a] border-[#222]" /></div>
                  <div><Label className="text-[#b0b0b0]">Cidade</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} className="bg-[#0a0a0a] border-[#222]" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-[#b0b0b0]">Capacidade</Label><Input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} className="bg-[#0a0a0a] border-[#222]" /></div>
                  <div><Label className="text-[#b0b0b0]">Contato</Label><Input value={form.contact} onChange={(e) => set("contact", e.target.value)} className="bg-[#0a0a0a] border-[#222]" /></div>
                </div>
                <div><Label className="text-[#b0b0b0]">Instagram</Label><Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className="bg-[#0a0a0a] border-[#222]" /></div>
                <div><Label className="text-[#b0b0b0]">Descrição</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="bg-[#0a0a0a] border-[#222]" /></div>
                <Button onClick={create} className="bg-[#a8f776] text-black hover:bg-[#8fd862] w-full">Cadastrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((v) => {
          const r = ratingFor(v.id);
          return (
          <Link key={v.id} to={`/venues/${v.id}`} className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-4 group hover:bg-[#181818] hover:border-[#2a2a2a] transition-colors block">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-[#a8f776]" />
              </div>
              <div className="flex items-center gap-2">
                {user && v.created_by_id === user.id && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(v.id); }} className="text-[#404040] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                )}
                <ChevronRight size={16} className="text-[#404040] group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="font-semibold text-white mt-3">{v.name}</div>
            {r.count > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <StarRating value={r.avg} readOnly size={13} />
                <span className="text-xs text-[#808080]">{r.avg.toFixed(1)} · {r.count} {r.count === 1 ? "avaliação" : "avaliações"}</span>
              </div>
            )}
            {v.address && <div className="text-xs text-[#909090] flex items-center gap-1 mt-1"><MapPin size={11} /> {v.address}{v.city && `, ${v.city}`}</div>}
            <div className="flex items-center gap-3 mt-2 text-xs text-[#707070]">
              {v.capacity && <span className="flex items-center gap-1"><Users size={11} /> {v.capacity}</span>}
              {v.instagram && <span className="flex items-center gap-1"><Instagram size={11} /> {v.instagram}</span>}
            </div>
            {v.description && <p className="text-xs text-[#808080] mt-2 line-clamp-2">{v.description}</p>}
          </Link>
          );
        })}
        {venues.length === 0 && <p className="text-[#505050] text-sm col-span-full text-center py-12">Nenhuma casa cadastrada. {user && "Cadastre a primeira!"}</p>}
      </div>
    </div>
  );
}