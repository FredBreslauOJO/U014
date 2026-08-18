import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 20;

export default function AdminEntityTable({
  columns,
  rows,
  loading,
  keyField = "id",
  onEdit,
  onDelete,
  renderRowActions,
  emptyLabel = "Nenhum registro encontrado.",
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="bg-[#121212] border border-[#1e1e1e] rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-[#1e1e1e] hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className="text-[#a0a0a0]">
                {col.label}
              </TableHead>
            ))}
            {(onEdit || onDelete || renderRowActions) && (
              <TableHead className="text-[#a0a0a0] text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-[#1a1a1a]">
                <TableCell colSpan={columns.length + 1}>
                  <Skeleton className="h-6 w-full bg-[#1a1a1a]" />
                </TableCell>
              </TableRow>
            ))}

          {!loading && pageRows.length === 0 && (
            <TableRow className="border-[#1a1a1a]">
              <TableCell colSpan={columns.length + 1} className="text-center text-[#606060] py-8">
                {emptyLabel}
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            pageRows.map((row) => (
              <TableRow key={row[keyField]} className="border-[#1a1a1a] hover:bg-[#161616]">
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-[#d0d0d0]">
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
                {(onEdit || onDelete || renderRowActions) && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {renderRowActions?.(row)}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-[#a0a0a0] hover:text-[#a8f776] transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-1.5 text-[#a0a0a0] hover:text-red-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e1e] text-xs text-[#808080]">
          <span>
            Página {page + 1} de {pageCount} · {rows.length} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="p-1.5 rounded hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
