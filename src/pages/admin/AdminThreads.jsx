import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase";
import { useAdminSort, createdDateColumn } from "@/lib/useAdminSort";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

export default function AdminThreads() {
  const [topics, setTopics] = useState([]);
  const [replyCounts, setReplyCounts] = useState({});
  const [allThreads, setAllThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data: all } = await supabase
      .from("threads")
      .select("*")
      .eq("status", "active")
      .order("created_date", { ascending: false });
    setAllThreads(all || []);
    setTopics((all || []).filter((t) => !t.parent_id));

    const counts = {};
    (all || []).filter((t) => t.parent_id).forEach((r) => {
      counts[r.parent_id] = (counts[r.parent_id] || 0) + 1;
    });
    setReplyCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const collectDescendantIds = (rootId) => {
    const ids = [];
    const stack = [rootId];
    while (stack.length) {
      const current = stack.pop();
      allThreads.filter((t) => t.parent_id === current).forEach((child) => {
        ids.push(child.id);
        stack.push(child.id);
      });
    }
    return ids;
  };

  const handleDelete = async () => {
    const ids = [deleting.id, ...collectDescendantIds(deleting.id)];
    await supabase.from("threads").update({ status: "disabled" }).in("id", ids);
    setAllThreads((all) => all.filter((t) => !ids.includes(t.id)));
    setTopics((ts) => ts.filter((t) => t.id !== deleting.id));
    setDeleting(null);
  };

  const { sort, handleSort, sorted: sortedTopics } = useAdminSort(topics, { key: "created_date", dir: "desc" }, {
    title: (r) => (r.title || r.content?.slice(0, 60) || "").toLowerCase(),
    author_name: (r) => (r.author_name || "anônimo").toLowerCase(),
    replies: (r) => replyCounts[r.id] || 0,
  });

  const columns = [
    { key: "title", label: "Título", sortable: true, render: (r) => r.title || r.content?.slice(0, 60) || "—" },
    { key: "author_name", label: "Autor", sortable: true, render: (r) => r.author_name || "Anônimo" },
    { key: "category", label: "Categoria", sortable: true, render: (r) => r.category || "geral" },
    { key: "replies", label: "Respostas", sortable: true, render: (r) => replyCounts[r.id] || 0 },
    createdDateColumn(),
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Threads</h1>
      <p className="text-[#808080] text-sm mt-1 mb-6">
        {loading ? "Carregando..." : `${sortedTopics.length} ${sortedTopics.length === 1 ? "tópico cadastrado" : "tópicos cadastrados"}`}
      </p>

      <AdminEntityTable
        columns={columns}
        rows={sortedTopics}
        loading={loading}
        onDelete={setDeleting}
        sort={sort}
        onSortChange={handleSort}
      />

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir este tópico?"
        description="O tópico e todas as respostas dentro dele ficarão ocultos. Um admin pode reativá-los depois."
        onConfirm={handleDelete}
      />
    </div>
  );
}
