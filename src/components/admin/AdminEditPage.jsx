import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminDeleteConfirm from "@/components/admin/AdminDeleteConfirm";

export default function AdminEditPage({
  title,
  backTo,
  onSubmit,
  saving,
  onDelete,
  deleteLabel = "Excluir este registro?",
  deleteDescription = "Esta ação não pode ser desfeita.",
  children,
}) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate(backTo)}
        className="inline-flex items-center gap-1.5 text-sm text-[#808080] hover:text-white mb-4"
      >
        <ArrowLeft size={15} /> Voltar
      </button>

      <h1 className="text-2xl font-black text-white mb-6">{title}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-5"
      >
        {children}

        <div className="flex items-center gap-3 pt-4 border-t border-[#1e1e1e] sticky bottom-0 bg-[#0a0a0a] pb-2">
          <Button type="submit" disabled={saving} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(backTo)}
            className="border-[#333] text-white hover:bg-[#1a1a1a]"
          >
            Cancelar
          </Button>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleting(true)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
            >
              <Trash2 size={16} className="mr-1.5" /> Excluir
            </Button>
          )}
        </div>
      </form>

      {onDelete && (
        <AdminDeleteConfirm
          open={deleting}
          onOpenChange={setDeleting}
          title={deleteLabel}
          description={deleteDescription}
          onConfirm={onDelete}
        />
      )}
    </div>
  );
}
