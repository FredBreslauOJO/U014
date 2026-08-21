import React from "react";
import { Users, ShieldAlert, Zap, Megaphone, Handshake, ScrollText } from "lucide-react";

export default function Manifesto() {
  return (
    <div className="px-4 md:px-8 py-10 max-w-[900px] mx-auto text-[#d0d0d0]">
      {/* Header */}
      <div className="mb-12 text-center">
        <span className="text-[#a8f776] uppercase tracking-widest font-black text-sm mb-2 block">
          A Plataforma da Cena
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase leading-none">
          O Manifesto <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a8f776] to-[#2e7d15]">
            Underground 014
          </span>
        </h1>
      </div>

      {/* Introdução */}
      <section className="mb-12 bg-[#121212] border border-[#1e1e1e] p-6 md:p-8 rounded-xl leading-relaxed text-lg">
        <p className="mb-4">
          Na contramão da pasteurização global, artistas e produtores do centro-oeste paulista decidiram se unificar em um movimento colaborativo de resistência e valorização da cena local.
        </p>
        <p className="mb-4">
          Em uma época dominada pela hiperglobalização, algoritmos ditando o que devemos consumir e o esvaziamento dos espaços presenciais, a cena cultural autônoma do DDD 014 (Bauru, Agudos, Marília, Botucatu, Jaú e região) construiu a sua própria resposta.
        </p>
        <p className="text-white font-bold text-xl mt-6 border-l-4 border-[#a8f776] pl-4">
          Esqueça o "Do It Yourself" (Faça Você Mesmo). O nosso lema é o DO IT OURSELVES (Façamos Nós Mesmos).
        </p>
      </section>

      {/* O Que Somos e O Que Não Somos */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* O que NÃO somos */}
        <div className="bg-[#1a1010] border border-red-900/30 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-red-400">
            <ShieldAlert size={24} />
            <h2 className="text-xl font-black uppercase tracking-wide">O que NÃO somos</h2>
          </div>
          <ul className="space-y-4 text-sm md:text-base text-[#b0b0b0]">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✖</span>
              <span><strong>Não somos uma agência de shows:</strong> O portal não é um "Job Center". Não estamos aqui para arrumar gigs ou agenciar a sua banda. O corre ainda é seu, nós apenas fornecemos as ferramentas e a rede de contatos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✖</span>
              <span><strong>Não somos uma "panelinha":</strong> Nosso objetivo não é fechar um círculo de amigos. Queremos expansão, braços abertos para quem chegar com respeito e vontade de somar.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✖</span>
              <span><strong>Não somos um balcão de negócios:</strong> Não vamos retirar a autonomia de ninguém para trancar artistas em modelos fechados de contrato ou cobrar porcentagens.</span>
            </li>
          </ul>
        </div>

        {/* O que SOMOS */}
        <div className="bg-[#101a12] border border-[#2e7d15]/30 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-[#a8f776]">
            <Users size={24} />
            <h2 className="text-xl font-black uppercase tracking-wide">O que SOMOS</h2>
          </div>
          <ul className="space-y-4 text-sm md:text-base text-[#b0b0b0]">
            <li className="flex items-start gap-2">
              <span className="text-[#a8f776] mt-1">✔</span>
              <span><strong>Uma ferramenta de concientização e união:</strong> Uma rede criada de forma orgânica e coletiva, onde dezenas de pessoas debatem diariamente para fomentar a região.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#a8f776] mt-1">✔</span>
              <span><strong>Um facilitador de intercâmbio:</strong> Conectamos Bauru, Jaú, Botucatu, Marília e toda a região para que as bandas circulem e compartilhem públicos, equipamentos e palcos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#a8f776] mt-1">✔</span>
              <span><strong>Totalmente gratuitos e abertos:</strong> O projeto não tem amarras, não tem dono central, não tem cobrança. No Slaves, No Masters!</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Regras e Ética de Trabalho */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <ScrollText size={24} className="text-[#a8f776]" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Guia de Conduta e Ética</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-[#121212] border border-[#1e1e1e] p-5 rounded-lg flex gap-4 items-start">
            <Handshake className="text-[#a8f776] shrink-0 mt-1" size={20} />
            <div>
              <h3 className="text-white font-bold mb-1">Apoio Mútuo e Ação Direta</h3>
              <p className="text-sm text-[#a0a0a0]">Se você quer que as casas de show abram portas para o seu projeto, prestigie o projeto dos seus pares. Vá aos shows, consuma no bar, compre o merchandising da banda amiga. A cena só sobrevive e se mostra rentável quando a gente se faz presente no público, e não apenas no palco.</p>
            </div>
          </div>

          <div className="bg-[#121212] border border-[#1e1e1e] p-5 rounded-lg flex gap-4 items-start">
            <Sparkles className="text-[#a8f776] shrink-0 mt-1" size={20} />
            <div>
              <h3 className="text-white font-bold mb-1">Toda Arte Importa</h3>
              <p className="text-sm text-[#a0a0a0]">O Underground não é exclusivo do Rock ou do Metal. Se você é do Hip Hop, Rap, Música Eletrônica, Punk, Funk, Ska ou Alternativo, o espaço é seu. Todo artista com som autoral e algo genuíno a dizer sofre com as mesmas faltas de espaço. O inimigo é outro; entre nós, existe apenas união.</p>
            </div>
          </div>

          <div className="bg-[#121212] border border-[#1e1e1e] p-5 rounded-lg flex gap-4 items-start">
            <Megaphone className="text-[#a8f776] shrink-0 mt-1" size={20} />
            <div>
              <h3 className="text-white font-bold mb-1">Ocupar, Resistir e Respeitar</h3>
              <p className="text-sm text-[#a0a0a0]">Todo espaço disposto a nos receber será ocupado. Seja um pub, uma pista de skate, uma praça ou um bar no interior. Contudo, exigimos e praticamos o respeito. Nenhuma forma de fascismo, racismo, machismo ou preconceito tem lugar aqui. Não seja pilantra, respeite o rolê e os trabalhadores envolvidos.</p>
            </div>
          </div>

          <div className="bg-[#121212] border border-[#1e1e1e] p-5 rounded-lg flex gap-4 items-start">
            <Zap className="text-[#a8f776] shrink-0 mt-1" size={20} />
            <div>
              <h3 className="text-white font-bold mb-1">Livre de Algoritmos</h3>
              <p className="text-sm text-[#a0a0a0]">Essa plataforma é o nosso oásis longe das mega-corporações de tecnologia. Aqui, não existe um robô escondendo o seu trabalho porque você não pagou impulsionamento. Seu material está lado a lado com os grandes nomes da nossa região. Divulgue, atualize e utilize essa rede a seu favor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Encerramento */}
      <div className="text-center mt-16 pb-8 border-t border-[#222] pt-8">
        <p className="text-[#808080] font-medium tracking-wider uppercase text-sm mb-2">Juntos somos mais fortes.</p>
        <p className="text-[#a8f776] font-black text-xl">DIY OR DIE. DO IT OURSELVES.</p>
      </div>
    </div>
  );
}

// Icon fallbacks (Sparkles não estava importado no padrão)
function Sparkles(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  )
}