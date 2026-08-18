import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/supabase";
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
      .order("created_date", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    await supabase.from("contact_messages").delete().eq("id", deleting.id);
    setMessages((ms) => ms.filter((m) => m.id !== deleting.id));
    setDeleting(null);
  };

  const columns = [
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "subject", label: "Assunto", render: (r) => r.subject || "—" },
    {
      key: "created_date",
      label: "Data",
      render: (r) => new Date(r.created_date).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Mensagens de Contato</h1>

      <AdminEntityTable
        columns={columns}
        rows={messages}
        loading={loading}
        onDelete={setDeleting}
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
