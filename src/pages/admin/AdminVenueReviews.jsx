import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

export default function AdminVenueReviews() {
  const [reviews, setReviews] = useState([]);
  const [venueNames, setVenueNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: v }] = await Promise.all([
      supabase.from("venue_reviews").select("*").order("created_date", { ascending: false }),
      supabase.from("venues").select("id, name"),
    ]);
    setReviews(r || []);
    setVenueNames(Object.fromEntries((v || []).map((x) => [x.id, x.name])));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    await supabase.from("venue_reviews").delete().eq("id", deleting.id);
    setReviews((rs) => rs.filter((r) => r.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    { key: "venue_id", label: "Casa", render: (r) => venueNames[r.venue_id] || r.venue_id },
    { key: "author_name", label: "Autor", render: (r) => r.author_name || "Anônimo" },
    { key: "rating", label: "Nota", render: (r) => `${r.rating} ★` },
    { key: "comment", label: "Comentário", render: (r) => <span className="line-clamp-2">{r.comment}</span> },
    {
      key: "created_date",
      label: "Data",
      render: (r) => new Date(r.created_date).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Avaliações de Casas</h1>

      <AdminEntityTable columns={columns} rows={reviews} loading={loading} onDelete={setDeleting} />

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir esta avaliação?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
