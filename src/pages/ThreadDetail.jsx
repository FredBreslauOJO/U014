import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ThreadNode from "@/components/ThreadNode";
import HeatFlames from "@/components/HeatFlames";
import { collectThreadDates, computeHeat } from "@/lib/threadHeat";

export default function ThreadDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [childrenMap, setChildrenMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    try {
      const [{ data: t }, { data: all }] = await Promise.all([
        supabase.from('threads').select('*').eq('id', id).single(),
        supabase.from('threads').select('*').order('created_date', { ascending: false })
      ]);
      setThread(t || null);
      const map = {};
      (all || []).forEach((r) => {
        if (r.parent_id) {
          (map[r.parent_id] = map[r.parent_id] || []).push(r);
        }
      });
      setChildrenMap(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const addTopic = async () => {
    if (!topic.trim() || !user) return;
    setSending(true);
    try {
      const payload = {
        content: topic.trim(),
        parent_id: id,
        author_name: user.full_name || user.email,
        category: thread?.category || "geral",
        created_by_id: user.id
      };
      const { data: created, error } = await supabase.from('threads').insert([payload]).select().single();
      if (!error && created) {
        setChildrenMap((m) => ({ ...m, [id]: [...(m[id] || []), created] }));
        setTopic("");
      }
    } finally {
      setSending(false);
    }
  };

  const onReply = async (parentId, text) => {
    const payload = {
      content: text,
      parent_id: parentId,
      author_name: user.full_name || user.email,
      category: thread?.category || "geral",
      created_by_id: user?.id
    };
    const { data: created, error } = await supabase.from('threads').insert([payload]).select().single();
    if (!error && created) {
      setChildrenMap((m) => ({ ...m, [parentId]: [...(m[parentId] || []), created] }));
    }
  };

  const onDelete = async (node) => {
    await supabase.from('threads').delete().eq('id', node.id);
    setChildrenMap((m) => {
      const next = {};
      Object.entries(m).forEach(([k, arr]) => {
        next[k] = arr.filter((x) => x.id !== node.id);
      });
      return next;
    });
  };

  if (loading) return <div className="px-8 py-20 text-center text-[#606060] text-sm">Carregando...</div>;
  if (!thread) return <div className="px-8 py-20 text-center text-[#606060] text-sm">Thread não encontrada.</div>;

  const topics = (childrenMap[id] || []).slice().sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const heat = computeHeat(collectThreadDates(childrenMap, id, thread.created_date));

  return (
    <div className="px-4 md:px-8 py-6 max-w-[800px] mx-auto">
      <Link to="/threads" className="inline-flex items-center gap-1.5 text-sm text-[#808080] hover:text-white mb-4">
        <ArrowLeft size={15} /> Voltar
      </Link>

      <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 mb-4">
        <span className="text-[10px] uppercase tracking-wider text-[#a8f776] bg-[#a8f776]/10 px-2 py-0.5 rounded">{thread.category || "geral"}</span>
        {heat > 0 && <HeatFlames level={heat} size={17} />}
        <h1 className="text-2xl font-black text-white tracking-tight mt-3">{thread.title || "Sem título"}</h1>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#a8f776] font-bold text-xs">
            {(thread.author_name || "?").charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-[#808080]">{thread.author_name || "Anônimo"} · {new Date(thread.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <p className="text-[#d0d0d0] text-sm mt-4 whitespace-pre-wrap leading-relaxed">{thread.content}</p>
      </div>

      {user ? (
        <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-3 mb-5">
          <div className="flex gap-2">
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Começa um novo tópico na conversa..."
              className="bg-[#0a0a0a] border-[#222] resize-none flex-1"
              rows={2}
            />
            <Button onClick={addTopic} disabled={sending || !topic.trim()} className="bg-[#a8f776] text-black hover:bg-[#8fd862] self-start">
              <Plus size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#707070] text-center mb-5">
          <Link to="/login" className="text-[#a8f776] underline">Entre</Link> para participar.
        </p>
      )}

      <div className="space-y-2">
        {topics.map((t) => (
          <ThreadNode key={t.id} node={t} childrenMap={childrenMap} user={user} onReply={onReply} onDelete={onDelete} depth={0} />
        ))}
        {topics.length === 0 && (
          <div className="text-center py-12 text-[#606060]">
            <MessageSquare size={30} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum tópico ainda. {user ? "Abre o primeiro!" : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
}