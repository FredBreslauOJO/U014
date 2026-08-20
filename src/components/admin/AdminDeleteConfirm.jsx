import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function AdminDeleteConfirm({
  open,
  onOpenChange,
  title = "Excluir este registro?",
  description = "O registro será desativado e ocultado do site. Um admin pode reativá-lo depois.",
  confirmLabel = "Excluir",
  onConfirm,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#121212] border-[#2a2a2a] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-[#a0a0a0]">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#333] text-white hover:bg-[#1a1a1a]">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
