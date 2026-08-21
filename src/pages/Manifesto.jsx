import React from "react";
import { Users, ShieldAlert, Zap, Megaphone, Handshake, ScrollText } from "lucide-react";

export default function Manifesto() {
  return (
    <div className="relative min-h-screen bg-[#0e0e0e] overflow-hidden pb-16">
      
      {/* Imagem de Fundo com Fade Escuro para mesclar com o resto da página */}
      <div 
        className="absolute top-0 left-0 w-full h-[700px] bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: "url('/images/manifestoBG.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e]/10 via-[#0e0e0e]/70 to-[#0e0e0e]"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-10 px-4 md:px-8 py-10 max-w-[900px] mx-auto flex flex-col items-center">
        
        {/* Espaçador para o título ficar mais para baixo, mostrando a imagem */}
        <div className="h-[250px] w-full"></div>

        {/* Título e Link */}
        <div className="text-center mb-12 w-full">
          <div className="bg-black px-4 py-1 inline-block mb-2 rounded">
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest m-0 leading-tight">
              O Manifesto
            </h1>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#a8f776] uppercase tracking-wide leading-tight">
            Underground 014
          </h2>
          <p className="text-[#a8f776] text-sm md:text-base mt-3 font-bold tracking-widest uppercase">
            underground014.com.br/manifesto
          </p>
        </div>

        {/* Texto do Manifesto (Revisado com as Cidades) */}
        <div className="w-full text-left text-[#d0d0d0] text-[15px] sm:text-base leading-relaxed space-y-6 mb-16">
          <p className="font-bold text-white text-lg">DO IT OURSELVES!</p>
          
          <p>
            O underground é a fonte de toda cultura e inovação que existe no mundo. Sem o underground, não existe mainstream.
          </p>
          
          <p>
            São os artistas, a cena e a rede de contatos que não só fomentam a verdadeira inovação cultural, como também são a fonte de uma economia gigante que passa despercebida dos grandes holofotes.
          </p>
          
          <p>
            Nós geramos ideias, movimentamos o mercado de trabalho e, com nossas criações, geramos valor econômico e cultural. Somos a história e somos a cultura que vibra e reflete o nosso mundo.
          </p>
          
          <p>
            Em uma época dominada pela hiperglobalização, algoritmos ditando o que devemos consumir e o esvaziamento dos espaços presenciais, a cena cultural autônoma de todo o DDD 014 — nascida da força de cidades como Agudos e São Manuel, e abraçando Bauru, Botucatu, Marília, Jaú e cada canto da nossa região — construiu a sua própria resposta.
          </p>
          
          <p>
            O Underground 014 surge como uma resposta a um mundo massificado que impõe formas predeterminadas de consumir cultura, que quase nunca refletem os interesses daqueles que a consomem. Somos forçados por algoritmos e plataformas a consumir aquilo que é do interesse de grupos e empresas com capital infinito, mas que, no final, só existem porque NÓS existimos, porque nós insistimos.
          </p>
          
          <p>
            O Underground é um ato de resistência, de organização coletiva e também de educação e preservação da nossa história e modos de vida. Sem o underground nos tornamos meros consumidores. O underground liberta, esclarece, cria algo a partir do nada. Isso é o poder da criação genuína e estamos aqui para lutar para que todos nós tenhamos esse direito preservado. Mas nada disso é feito sem união, sem a força do coletivo, sem a luta do grupo.
          </p>
          
          <p>
            Mais do que respeitar a diversidade, abraçamos todas as culturas que fomentam a cena do underground da nossa região. Somos em nossa maioria músicos, mas também ilustradores, comerciantes, prestadores de serviço e artistas dos mais diferentes tipos que fazem da cena algo real e tangível. É um universo multifacetado, composto por diferentes gêneros, histórias e competências, e por isso mesmo somos fortes.
          </p>
          
          <p>
            Por isso, abraçamos e respeitamos a diversidade como um princípio básico deste grupo.
          </p>

          <p>
            Todos são bem-vindos, não há líderes e não há seguidores. Esse espaço é de todos, de forma autônoma, mas sob a responsabilidade de cada um.
          </p>
        </div>

        {/* O Que Somos e O Que Não Somos (DE VOLTA AQUI) */}
        <div className="grid md:grid-cols-2 gap-6 mb-16 w-full">
          {/* O que SOMOS */}
          <div className="bg-[#101a12] border border-[#2e7d15]/30 p-6 rounded-xl flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-[#a8f776]">
              <Users size={24} />
              <h2 className="text-xl font-black uppercase tracking-wide">O que SOMOS</h2>
            </div>
            <ul className="space-y-4 text-sm md:text-base text-[#b0b0b0] flex-1">
              <li className="flex items-start gap-2">
                <span className="text-[#a8f776] mt-1 shrink-0">✔</span>
                <span><strong>Uma ferramenta de conscientização e união:</strong> Uma rede criada de forma orgânica e coletiva, onde dezenas de pessoas debatem diariamente para fomentar a região.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a8f776] mt-1 shrink-0">✔</span>
                <span><strong>Um facilitador de intercâmbio:</strong> Conectamos todas as cidades do nosso interior, sem distinção de tamanho, para que as bandas circulem e compartilhem públicos, equipamentos e palcos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a8f776] mt-1 shrink-0">✔</span>
                <span><strong>Totalmente gratuitos e abertos:</strong> O projeto não tem amarras, não tem dono central, não tem cobrança. No Slaves, No Masters!</span>
              </li>
            </ul>
          </div>

          {/* O que NÃO somos */}
          <div className="bg-[#1a1010] border border-red-900/30 p-6 rounded-xl flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-red-400">
              <ShieldAlert size={24} />
              <h2 className="text-xl font-black uppercase tracking-wide">O que NÃO somos</h2>
            </div>
            <ul className="space-y-4 text-sm md:text-base text-[#b0b0b0] flex-1">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1 shrink-0">✖</span>
                <span><strong>Não somos uma agência de shows:</strong> O portal não é um "Job Center". Não estamos aqui para arrumar gigs ou agenciar a sua banda. O corre ainda é seu, nós apenas fornecemos as ferramentas e a rede de contatos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1 shrink-0">✖</span>
                <span><strong>Não somos uma "panelinha":</strong> Nosso objetivo não é fechar um círculo de amigos. Queremos expansão, braços abertos para quem chegar com respeito e vontade de somar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1 shrink-0">✖</span>
                <span><strong>Não somos um balcão de negócios:</strong> Não vamos retirar a autonomia de ninguém para trancar artistas em modelos fechados de contrato ou cobrar porcentagens.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regras e Ética de Trabalho (DE VOLTA AQUI) */}
        <section className="mb-12 w-full">
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
        <div className="text-center w-full mt-8 pb-8 border-t border-[#222] pt-12">
          <p className="text-[#808080] font-medium tracking-wider uppercase text-sm mb-2">Juntos somos mais fortes.</p>
          <p className="text-[#a8f776] font-black text-2xl md:text-3xl">DIY OR DIE. DO IT OURSELVES.</p>
        </div>
      </div>
    </div>
  );
}

// Custom Sparkles Icon fixado (com height e width travados)
function Sparkles({ size = 24, className = "", ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}