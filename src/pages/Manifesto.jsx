<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manifesto | Underground 014</title>
    <!-- Incluindo Tailwind CSS para estilização (conforme seu exemplo) -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        /* Ajustes finos para garantir que a imagem ocupe a horizontal inteira e o texto fique legível */
        .manifesto-bg {
            background-image: url('/images/manifestoBG.png'); /* Chamada da imagem na pasta public/images */
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            width: 100%;
        }
        /* Estilo para a caixa do título (conforme seu exemplo) */
        .titulo-container {
            position: relative;
            background-color: transparent;
        }
        .manifesto-titulo-box {
            background-color: #000;
            padding: 10px;
            display: inline-block;
            border-radius: 4px;
        }
        .manifesto-titulo {
            background-color: #A3E635; /* Verde limão vibrante */
            color: #000;
            padding: 0 10px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .manifesto-subtitulo {
            color: #A3E635;
            font-weight: 800;
            text-transform: uppercase;
        }
        /* Estilo para o bloco de texto inferior sobre fundo escuro */
        .texto-bloco-inferior {
            background-color: #0e0e0e; /* Fundo escuro do site */
            padding-top: 40px;
            padding-bottom: 60px;
        }
    </style>
</head>
<body class="bg-[#0e0e0e] text-white">

    <div class="flex">
        <!-- Barra Lateral Esquerda (conforme seu exemplo) -->
        <aside class="w-64 bg-[#0e0e0e] p-6 flex flex-col border-r border-gray-800">
            <div class="mb-10 flex items-center">
                <img src="/logo-example.png" alt="UNDERGROUND 014" class="h-12 mr-3">
                <h1 class="text-white text-xl font-black">UNDERGROUND 014</h1>
            </div>
            <nav class="space-y-4">
                <a href="#" class="flex items-center text-gray-400 hover:text-white">
                    <span class="material-icons mr-3">home</span> Início
                </a>
                <a href="#" class="flex items-center text-white font-bold bg-gray-800 p-2 rounded">
                    <span class="material-icons mr-3">library_books</span> Manifesto
                </a>
                <a href="#" class="flex items-center text-gray-400 hover:text-white">
                    <span class="material-icons mr-3">bands</span> Bandas
                </a>
                <!-- ... outros links ... -->
            </nav>
            
            <div class="mt-10 border-t border-gray-800 pt-6">
                <h2 class="text-gray-600 text-xs uppercase font-bold mb-4">Minhas Bandas</h2>
                <!-- Lista de bandas conforme seu exemplo -->
                <ul class="space-y-2 text-gray-400 text-sm">
                    <li>Überide</li>
                    <li>Plenitude S.A.</li>
                    <li>...outras</li>
                </ul>
            </div>
            
            <div class="mt-auto border-t border-gray-800 pt-6 flex items-center">
                <img src="/perfil-exemplo.png" alt="" class="w-10 h-10 rounded-full mr-3">
                <div>
                    <p class="text-white text-sm font-bold">Frederico Breslau</p>
                    <a href="#" class="text-gray-500 text-xs">Gerenciar</a>
                </div>
            </div>
        </aside>

        <!-- Área de Conteúdo Principal -->
        <main class="flex-1">
            <!-- Bloco da Imagem ManifestoBG e Título (ocupa horizontal inteira) -->
            <section class="manifesto-bg flex items-center justify-center h-[500px] relative">
                <!-- Título centralizado (conforme seu exemplo) -->
                <div class="text-center p-6 text-xl">
                    <div class="manifesto-titulo-box mb-3">
                        <span class="manifesto-titulo">O MANIFESTO</span>
                    </div>
                    <p class="manifesto-subtitulo">UNDERGROUND 014</p>
                </div>
            </section>

            <!-- Bloco de Texto do Manifesto sobre Fundo Escuro -->
            <section class="texto-bloco-inferior p-8 md:p-12">
                <div class="max-w-3xl mx-auto space-y-6 text-gray-100 text-sm md:text-base leading-relaxed">
                    <p class="font-bold">DO IT OURSELVES!</p>
                    
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
                </div>
            </section>
        </main>
    </div>

</body>
</html>