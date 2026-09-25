import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { supabase } from "@/supabase";
import { entityPath } from "@/lib/slug";
import { formatUrl, getSocialImageUrl } from "@/lib/supabaseStorage";
import SeoMeta from "@/components/SeoMeta";

const CONFIG = {
  shows: { table: "shows", label: "Show", name: "title", description: "description", image: "flyer_url" },
  venues: { table: "venues", label: "Casa de shows", name: "name", description: "description", image: "photo_url" },
  partners: { table: "partners", label: "Parceiro", name: "name", description: "bio", image: "photo_url" },
  news: { table: "news", label: "Notícia", name: "title", description: "content", image: "image_url" },
  threads: { table: "threads", label: "Thread", name: "title", description: "content", image: "image_url" },
};

export default function PublicEntityDetail({ type }) {
  const { slug } = useParams();
  const config = CONFIG[type];
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const bySlug = await supabase.from(config.table).select("*").eq("slug", slug).maybeSingle();
      const result = bySlug.data || (await supabase.from(config.table).select("*").eq("id", slug).maybeSingle()).data;
      if (active) { setEntity(result || null); setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [config.table, slug]);

  if (loading) return <div className="px-8 py-20 text-center text-[#606060]">Carregando...</div>;
  if (!entity) return <div className="px-8 py-20 text-center text-[#606060]">Conteúdo não encontrado.</div>;

  const name = entity[config.name] || config.label;
  const description = entity[config.description] || `${config.label} na Underground 014.`;
  const path = entityPath(type, entity);
  const image = entity[config.image];

  return (
    <main className="max-w-[900px] mx-auto px-4 md:px-8 py-8">
      <SeoMeta title={`Underground 014 | ${name}`} description={description} path={path} image={getSocialImageUrl(image)} imageAlt={name} />
      <Link to={`/${type}`} className="inline-flex items-center gap-1.5 text-sm text-[#808080] hover:text-white mb-5"><ArrowLeft size={15} /> Voltar</Link>
      <article className="bg-[#121212] border border-[#1e1e1e] rounded-xl overflow-hidden">
        {image && <img src={formatUrl(image)} alt={name} className="w-full max-h-[480px] object-cover" />}
        <div className="p-6 md:p-8">
          <p className="text-xs uppercase tracking-widest font-bold text-[#a8f776]">{config.label}</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2">{name}</h1>
          {entity.date && <p className="mt-3 flex items-center gap-2 text-sm text-[#a0a0a0]"><CalendarDays size={15} /> {new Date(`${entity.date}T12:00:00`).toLocaleDateString("pt-BR")}{entity.time ? ` · ${entity.time}` : ""}</p>}
          {(entity.city || entity.address) && <p className="mt-2 flex items-center gap-2 text-sm text-[#a0a0a0]"><MapPin size={15} /> {[entity.address, entity.city].filter(Boolean).join(", ")}</p>}
          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-[#d0d0d0]">{description}</p>
          {entity.ticket_url && <a className="mt-6 inline-flex items-center gap-2 text-sm text-[#a8f776]" href={entity.ticket_url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Ingressos</a>}
          {entity.external_link && <a className="mt-6 inline-flex items-center gap-2 text-sm text-[#a8f776]" href={entity.external_link} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Link original</a>}
          {entity.portfolio_url && <a className="mt-6 inline-flex items-center gap-2 text-sm text-[#a8f776]" href={entity.portfolio_url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Portfólio</a>}
        </div>
      </article>
    </main>
  );
}
