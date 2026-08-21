import React from "react";

export default function Manifesto() {
  return (
    <div className="relative min-h-screen bg-[#0e0e0e] overflow-hidden">
      
      {/* Imagem de Fundo com Fade Escuro para mesclar com o resto da página */}
      <div 
        className="absolute top-0 left-0 w-full h-[600px] bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: "url('/images/manifestoBG.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e]/10 via-[#0e0e0e]/60 to-[#0e0e0e]"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-10 px-4 md:px-8 py-10 max-w-[800px] mx-auto flex flex-col items-center">
        
        {/* Espaçador para o título ficar mais para baixo, mostrando a imagem */}
        <div className="h-[250px] w-full"></div>

        {/* Título */}
        <div className="text-center mb-10 w-full">
          <div className="bg-black px-4 py-1 inline-block mb-1">
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest m-0 leading-tight">
              O Manifesto
            </h1>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#a8f776] uppercase tracking-wide leading-tight">
            Underground 014
          </h2>
        </div>

        {/* Texto do Manifesto */}
        <div className="w-full text-left text-[#d0d0d0] text-sm md:text-base leading-relaxed space-y-6 pb-20">
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

          <p className="text-center font-bold text-[#a8f776] text-lg mt-8 pt-8 border-t border-[#222]">
            O underground nunca morre, mas cabe a nós lutar por uma vida próspera e rica.
          </p>
        </div>

      </div>
    </div>
  );
}