import React, { useState } from "react";
import { Send, MessageSquare, MessageCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Preencha nome, email e mensagem", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([form]);
      if (error) throw error;
      toast({ title: "Mensagem enviada! Obrigado pelo contato." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (e) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[700px] mx-auto pb-20">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#a8f776]/10 border border-[#a8f776]/30 flex items-center justify-center mx-auto mb-4">
          <MessageCircle size={28} className="text-[#a8f776]" />
        </div>
        <h1 className="text-3xl font-black text-white">Contato e Comunidade</h1>
        <p className="text-[#808080] text-sm mt-2">Conecte-se com a cena ou mande uma mensagem direta pra gente.</p>
      </div>

      {/* BLOCO DO WHATSAPP */}
      <div className="bg-[#101a12] border border-[#2e7d15]/30 rounded-xl p-6 mb-10">
        <div className="flex items-center gap-3 mb-3">
          {/* Custom SVG para imitar o logo do WhatsApp combinando com o tema */}
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wide">Grupo Oficial (WhatsApp)</h2>
        </div>
        
        <p className="text-[#d0d0d0] text-sm leading-relaxed mb-5">
          Convidamos você a fazer parte do nosso grupo do WhatsApp. Este é um espaço coletivo de troca de informações, contatos e fomento da região. Porém, temos regras rígidas de convivência:
        </p>

        <ul className="space-y-3 text-sm text-[#b0b0b0] mb-6 bg-[#0a0a0a]/50 p-4 rounded-lg border border-[#1a1a1a]">
          <li className="flex items-start gap-2">
            <span className="text-[#a8f776] shrink-0 mt-0.5">✔</span>
            <span><strong>Respeito e Ética:</strong> A postura profissional é inegociável. Não toleramos intolerantes, racismo, machismo ou qualquer tipo de preconceito.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#a8f776] shrink-0 mt-0.5">✔</span>
            <span><strong>Foco na Cena:</strong> O grupo é feito de artistas para artistas, produtores e pessoas que apoiam ativamente a cena underground local.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-red-200"><strong>Sem Publicidade Solta:</strong> Não é um lugar para spam de produtos, propagandas aleatórias ou correntes.</span>
          </li>
        </ul>

        <a href="https://chat.whatsapp.com/FBjRr9SdUaKL5AtDxRtRKS" target="_blank" rel="noreferrer" className="block">
          <Button className="w-full bg-[#25D366] text-black hover:bg-[#1ebd5b] font-black text-sm py-6">
            LI AS REGRAS E QUERO ENTRAR NO GRUPO
          </Button>
        </a>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-[#222] flex-1"></div>
        <span className="text-xs font-bold text-[#606060] uppercase tracking-widest">Ou envie um Email</span>
        <div className="h-px bg-[#222] flex-1"></div>
      </div>

      {/* FORMULÁRIO DE CONTATO (EMAIL) */}
      <div className="bg-[#121212] border border-[#1e1e1e] rounded-lg p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-[#b0b0b0]">Nome *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="bg-[#0a0a0a] border-[#222] text-white" />
          </div>
          <div>
            <Label className="text-[#b0b0b0]">Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="bg-[#0a0a0a] border-[#222] text-white" />
          </div>
        </div>
        <div>
          <Label className="text-[#b0b0b0]">Assunto</Label>
          <Input value={form.subject} onChange={(e) => set("subject", e.target.value)} className="bg-[#0a0a0a] border-[#222] text-white" />
        </div>
        <div>
          <Label className="text-[#b0b0b0]">Mensagem *</Label>
          <Textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={6} className="bg-[#0a0a0a] border-[#222] text-white resize-none" />
        </div>
        <Button onClick={submit} disabled={sending} className="bg-[#a8f776] text-black hover:bg-[#8fd862] font-bold w-full">
          <Send size={16} className="mr-2" /> {sending ? "Enviando..." : "Enviar mensagem"}
        </Button>
      </div>

      <div className="mt-6 flex items-start gap-3 bg-[#0e0e0e] border border-[#1a1a1a] rounded-lg p-4">
        <MessageSquare size={18} className="text-[#a8f776] shrink-0 mt-0.5" />
        <p className="text-xs text-[#808080]">
          O Underground 014 é um espaço colaborativo da cena underground local.
        </p>
      </div>
    </div>
  );
}