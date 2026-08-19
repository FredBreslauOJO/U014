import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/supabase";
import { useAdminSort, createdDateColumn } from "@/lib/useAdminSort";
import AdminEntityTable from "@/components/admin/AdminEntityTable";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("status", "active")
      .order("created_date", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    await supabase.from("contact_messages").update({ status: "disabled" }).eq("id", deleting.id);
    setMessages((ms) => ms.filter((m) => m.id !== deleting.id));
    setDeleting(null);
  };

  const { sort, handleSort, sorted: sortedMessages } = useAdminSort(messages, { key: "created_date", dir: "desc" });

  const columns = [
    { key: "name", label: "Nome", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "subject", label: "Assunto", sortable: true, render: (r) => r.subject || "—" },
    createdDateColumn(),
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Mensagens de Contato</h1>
      <p className="text-[#808080] text-sm mt-1 mb-6">
        {sortedMessages.length} {sortedMessages.length === 1 ? "mensagem recebida" : "mensagens recebidas"}
      </p>

      <AdminEntityTable
        columns={columns}
        rows={sortedMessages}
        loading={loading}
        onDelete={setDeleting}
        sort={sort}
        onSortChange={handleSort}
        renderRowActions={(row) => (
          <button
            onClick={() => setViewing(row)}
            className="p-1.5 text-[#a0a0a0] hover:text-[#a8f776] transition-colors"
            title="Ver mensagem"
          >
            <Eye size={14} />
          </button>
        )}
      />

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-[#121212] border-[#2a2a2a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{viewing?.subject || "Mensagem de contato"}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-[#a0a0a0] space-y-1">
            <div>
              <strong className="text-white">{viewing?.name}</strong> · {viewing?.email}
            </div>
            <p className="text-[#d0d0d0] whitespace-pre-wrap pt-2">{viewing?.message}</p>
          </div>
        </DialogContent>
      </Dialog>

      <AdminDeleteConfirm
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir esta mensagem?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
