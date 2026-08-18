import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, LogOut, Save, Loader2 } from "lucide-react";
import { supabase } from "@/supabase";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Atualiza Nome (User Metadata)
      const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
      if (metaError) throw metaError;

      // Atualiza E-mail (se alterado)
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast({
          title: "Confirmação enviada!",
          description: "Enviamos um link para o seu novo e-mail para confirmar a alteração.",
        });
      }

      // Atualiza Senha (se preenchida)
      if (newPassword.trim()) {
        const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
        if (passError) throw passError;
        setNewPassword("");
      }

      toast({ title: "Perfil atualizado com sucesso!" });
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="px-4 md:px-8 py-8 max-w-[600px] mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <User className="text-[#a8f776]" size={28} /> Minha Conta
          </h1>
          <p className="text-[#808080] text-sm mt-1">
            Gerencie seus dados pessoais, senha e acesso.
          </p>
        </div>
      </div>

      <div className="bg-[#121212] border border-[#1e1e1e] rounded-xl p-6 space-y-6">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <Label className="text-[#b0b0b0] text-xs font-semibold block mb-1">
              Nome de Exibição / Nome Completo
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" size={16} />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu Nome"
                className="bg-[#0a0a0a] border-[#222] text-white pl-10 h-11"
              />
            </div>
          </div>

          <div>
            <Label className="text-[#b0b0b0] text-xs font-semibold block mb-1">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" size={16} />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-[#0a0a0a] border-[#222] text-white pl-10 h-11"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-[#b0b0b0] text-xs font-semibold block mb-1">
              Nova Senha <span className="text-[#606060] font-normal">(deixe em branco para não alterar)</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060]" size={16} />
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#0a0a0a] border-[#222] text-white pl-10 h-11"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold w-full h-11 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" /> Salvar Alterações
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-[#1a1a1a]">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold h-11 flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Sair da Conta (Logout)
          </Button>
        </div>
      </div>
    </div>
  );
}