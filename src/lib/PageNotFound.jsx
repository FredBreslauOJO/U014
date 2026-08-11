import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white px-4 text-center">
      <h1 className="text-6xl font-black text-[#a8f776] mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Página não encontrada</h2>
      <p className="text-[#808080] text-sm max-w-md mb-6">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Button asChild className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold">
        <Link to="/">
          <Home size={16} className="mr-2" /> Voltar para o Início
        </Link>
      </Button>
    </div>
  );
}