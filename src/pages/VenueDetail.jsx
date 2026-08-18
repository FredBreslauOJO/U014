import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Users, Instagram, Send, Trash2 } from "lucide-react";
import { supabase } from "@/supabase"; // <-- Ponte Supabase
import { useAuth } from "@/lib/AuthContext";
import { useIsAdmin } from "@/lib/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";

export default function VenueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: v }, { data: r }] = await Promise.all([
        supabase.from('venues').select('*').eq('id', id).single(),
        supabase.from('venue_reviews').select('*').eq('venue_id', id)
      ]);
      setVenue(v || null);
      setReviews((r || []).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;

  const submit = async () => {
    if (!user || !comment.trim()) return;
    setSending(true);
    try {
      const payload = {
        venue_id: id,
        rating,
        comment: comment.trim(),
        author_name: user.full_name || user.email,
        created_by_id: user.id
      };
      const { data: created, error } = await supabase.from('venue_reviews').insert([payload]).select().single();
      if (!error && created) {
        setReviews([created, ...reviews]);
        setComment("");
        setRating(5);
      }
    } finally {
      setSending(false);
    }
  };

  const del = async (r) => {
    await supabase.from('venue_reviews').delete().eq('id', r.id);
    setReviews(reviews.filter((x) => x.id !== r.id));
  };

  if (loading) return <div className="px-8 py-20 text-center text-[#606060] text-sm">Carregando...</div>;
  if (!venue) return <div className="px-8 py-20 text-center text-[#606060] text-sm">Casa não encontrada.</div>;

  return (
    <div className="px-4 md:px-8 py-6 max-w-[800px] mx-auto">
      <Link to="/venues" className="inline-flex items-center gap-1.5 text-sm text-[#808080] hover:text-white mb-4">
        <ArrowLeft size={15} /> Casas de Shows
      </Link>

      <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <Building2 size={26} className="text-[#a8f776]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-white tracking-tight">{venue.name}</h1>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <StarRating value={avg} readOnly size={15} />
                <span className="text-xs text-[#909090]">{avg.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}</span>
              </div>
            )}
            {venue.address && <div className="text-sm text-[#909090] flex items-center gap-1.5 mt-2"><MapPin size={13} /> {venue.address}{venue.city && `, ${venue.city}`}</div>}
            <div className="flex items-center gap-4 mt-2 text-xs text-[#707070]">
              {venue.capacity && <span className="flex items-center gap-1"><Users size={12} /> {venue.capacity} pessoas</span>}
              {venue.instagram && <a href={`https://instagram.com/${venue.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white"><Instagram size={12} /> {venue.instagram}</a>}
            </div>
            {venue.description && <p className="text-sm text-[#b0b0b0] mt-3 leading-relaxed">{venue.description}</p>}
          </div>
        </div>
      </div>

      <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-5 mb-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Avaliar esta casa</h2>
        {user ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <StarRating value={rating} onChange={setRating} size={24} />
              <span className="text-xs text-[#808080]">{rating} estrela{rating !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex gap-2">
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conta como foi a experiência..." className="bg-[#0a0a0a] border-[#222] resize-none flex-1" rows={2} />
              <Button onClick={submit} disabled={sending || !comment.trim()} className="bg-[#a8f776] text-black hover:bg-[#8fd862] self-start">
                <Send size={16} />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-[#707070]"><Link to="/login" className="text-[#a8f776] underline">Entre</Link> para avaliar e comentar.</p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">{reviews.length} {reviews.length === 1 ? "comentário" : "comentários"}</h2>
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#a8f776] font-bold text-xs">{(r.author_name || "?").charAt(0).toUpperCase()}</div>
                  <span className="text-sm font-medium text-white">{r.author_name || "Anônimo"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} readOnly size={13} />
                  {user && (user.id === r.created_by_id || isAdmin) && (
                    <button onClick={() => del(r)} className="text-[#404040] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#c0c0c0] mt-2 whitespace-pre-wrap">{r.comment}</p>
              <p className="text-[10px] text-[#606060] mt-2">{new Date(r.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-[#606060] text-center py-6">Sem comentários ainda. Seja o primeiro a avaliar.</p>}
        </div>
      </div>
    </div>
  );
}