import React, { useState } from "react";
import { Mail, Send, MessageSquare } from "lucide-react";
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
    <div className="px-4 md:px-8 py-6 max-w-[700px] mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#a8f776]/10 border border-[#a8f776]/30 flex items-center justify-center mx-auto mb-4">
          <Mail size={28} className="text-[#a8f776]" />
        </div>
        <h1 className="text-3xl font-black text-white">Contato</h1>
        <p className="text-[#808080] text-sm mt-2">Tem uma dúvida, sugestão ou parceria? Manda pra gente.</p>
      </div>

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