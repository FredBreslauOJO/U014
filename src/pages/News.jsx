import React, { useState, useEffect } from "react";
import { Newspaper, Plus, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function News() {
  const { toast } = useToast();
  const [news, setNews] = useState([]);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "geral", image_url: "" });

  const load = async () => {
    const { data } = await supabase.from('news').select('*').order('created_date', { ascending: false });
    setNews(data || []);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const create = async () => {
    if (!form.title.trim() || !form.content.trim()) { 
      toast({ title: "Título e conteúdo obrigatórios", variant: "destructive" }); 
      return; 
    }
    const payload = {
      ...form,
      author_name: user?.full_name || user?.email,
      created_by_id: user?.id
    };
    const { error } = await supabase.from('news').insert([payload]);
    if (error) { toast({ title: "Erro ao publicar", variant: "destructive" }); return; }

    toast({ title: "Notícia publicada!" });
    setForm({ title: "", content: "", category: "geral", image_url: "" });
    setOpen(false);
    load();
  };

  const remove = async (id) => {
    await supabase.from('news').delete().eq('id', id);
    setNews(news.filter((n) => n.id !== id));
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2"><Newspaper className="text-[#a8f776]" /> Notícias</h1>
          <p className="text-[#808080] text-sm mt-1">Portal da cena underground</p>
        </div>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#a8f776] text-black hover:bg-[#8fd862]"><Plus size={16} className="mr-1" /> Publicar</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-[#222] text-white max-w-lg">
              <DialogHeader><DialogTitle className="text-white">Publicar notícia</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-[#b0b0b0]">Título *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-[#0a0a0a] border-[#222]" /></div>
                <div><Label className="text-[#b0b0b0]">Categoria</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="geral, show, lançamento..." className="bg-[#0a0a0a] border-[#222]" /></div>
                <div><Label className="text-[#b0b0b0]">Conteúdo *</Label><Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={6} className="bg-[#0a0a0a] border-[#222]" /></div>
                <div><Label className="text-[#b0b0b0]">URL da imagem</Label><Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..." className="bg-[#0a0a0a] border-[#222]" /></div>
                <Button onClick={create} className="bg-[#a8f776] text-black hover:bg-[#8fd862] w-full">Publicar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {news.map((n) => (
          <article key={n.id} className="bg-[#121212] border border-[#1e1e1e] rounded-lg overflow-hidden group">
            <div className="flex flex-col md:flex-row">
              {n.image_url && <img src={n.image_url} alt="" className="w-full md:w-56 h-40 md:h-auto object-cover shrink-0" />}
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#a8f776] uppercase tracking-widest font-bold">{n.category}</span>
                    <span className="text-[10px] text-[#606060] flex items-center gap-1"><Calendar size={10} /> {new Date(n.created_date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  {user && n.created_by_id === user.id && (
                    <button onClick={() => remove(n.id)} className="text-[#404040] hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mt-2">{n.title}</h2>
                <p className="text-sm text-[#b0b0b0] mt-2 whitespace-pre-wrap line-clamp-4">{n.content}</p>
                {n.author_name && <p className="text-xs text-[#606060] mt-3">— {n.author_name}</p>}
              </div>
            </div>
          </article>
        ))}
        {news.length === 0 && <p className="text-[#505050] text-sm text-center py-12">Nenhuma notícia publicada. {user && "Publique a primeira!"}</p>}
      </div>
    </div>
  );
}