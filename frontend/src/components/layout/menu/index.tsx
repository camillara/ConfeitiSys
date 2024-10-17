import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa"; // Import dos ícones

export const Menu: React.FC = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true); // Começa expandido em telas grandes

  // Hook para detectar quando a tela é pequena
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsExpanded(false); // Recolher o menu para telas pequenas
      } else {
        setIsExpanded(true); // Manter expandido em telas grandes
      }
    };
    window.addEventListener("resize", handleResize);

    // Definir o estado inicial
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsExpanded(!isExpanded); // Alterna o estado do menu expandido ou recolhido
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsExpanded(false); // Recolher o menu em telas pequenas após clicar em um item
    }
  };

  return (
    <aside
      style={{
        width: isExpanded ? "200px" : "50px", // Largura de 50px quando recolhido e 200px quando expandido
        backgroundColor: "#3273dc", // Cor de fundo azul
        position: "fixed", // Menu fixo
        top: 0,
        left: 0,
        height: "auto", // Altura automática de acordo com o conteúdo
        paddingBottom: "10px", // Pequeno espaçamento inferior
        zIndex: 1000, // Garante que o menu fique na frente
        transition: "width 0.3s", // Transição suave para largura
        boxShadow: isExpanded ? "2px 0 5px rgba(0, 0, 0, 0.1)" : "none", // Sombra apenas quando expandido
        overflow: "hidden", // Esconde conteúdo quando recolhido
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Ícone centralizado quando recolhido
          padding: "10px", // Espaçamento ao redor do ícone
        }}
      >
        {isExpanded ? (
          <FaTimes
            onClick={toggleMenu} // Ícone de fechar quando o menu está expandido
            style={{ cursor: "pointer", color: "white", fontSize: "24px" }} // Estilo do ícone de fechar
          />
        ) : (
          <FaBars
            onClick={toggleMenu} // Ícone de abrir quando o menu está recolhido
            style={{ cursor: "pointer", color: "white", fontSize: "24px" }} // Estilo do ícone de abrir
          />
        )}
      </div>

      <div
        style={{
          display: isExpanded ? "block" : "none", // Itens só aparecem quando o menu está expandido
          padding: "10px", // Espaçamento interno
        }}
      >
        <ul
          style={{
            listStyleType: "none", // Remove o estilo de lista padrão
            padding: 0,
            margin: 0,
          }}
        >
          <li
            style={{
              margin: "15px 0",
              cursor: "pointer",
              transition: "font-size 0.3s, background-color 0.3s", // Animação suave no tamanho da fonte e na cor de fundo
              fontSize: "16px", // Tamanho inicial da fonte
              padding: "10px", // Espaçamento interno para os itens do menu
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.fontSize = "20px"; // Aumenta a fonte ao passar o mouse
              e.currentTarget.style.backgroundColor = "#0056b3"; // Muda a cor de fundo ao passar o mouse
              e.currentTarget.style.fontWeight = "bold"; // Deixa o texto em negrito
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.fontSize = "16px"; // Volta ao tamanho original
              e.currentTarget.style.backgroundColor = "transparent"; // Volta ao fundo transparente
            }}
            onClick={handleLinkClick}
          >
            <Link href="/consultas/produtos">
              <a style={{ color: "white", textDecoration: "none" }}>Produtos</a>
            </Link>
          </li>

          <li
            style={{
              margin: "15px 0",
              cursor: "pointer",
              transition: "font-size 0.3s, background-color 0.3s", // Animação suave no tamanho da fonte e na cor de fundo
              fontSize: "16px", // Tamanho inicial da fonte
              padding: "10px", // Espaçamento interno para os itens do menu
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.fontSize = "20px"; // Aumenta a fonte ao passar o mouse
              e.currentTarget.style.backgroundColor = "#0056b3"; // Muda a cor de fundo ao passar o mouse
              e.currentTarget.style.fontWeight = "bold"; // Deixa o texto em negrito
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.fontSize = "16px"; // Volta ao tamanho original
              e.currentTarget.style.backgroundColor = "transparent"; // Volta ao fundo transparente
            }}
            onClick={handleLinkClick}
          >
            <Link href="/consultas/clientes">
              <a style={{ color: "white", textDecoration: "none" }}>Clientes</a>
            </Link>
          </li>

          <li
            style={{
              margin: "15px 0",
              cursor: "pointer",
              transition: "font-size 0.3s, background-color 0.3s", // Animação suave no tamanho da fonte e na cor de fundo
              fontSize: "16px", // Tamanho inicial da fonte
              padding: "10px", // Espaçamento interno para os itens do menu
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.fontSize = "20px"; // Aumenta a fonte ao passar o mouse
              e.currentTarget.style.backgroundColor = "#0056b3"; // Muda a cor de fundo ao passar o mouse
              e.currentTarget.style.fontWeight = "bold"; // Deixa o texto em negrito
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.fontSize = "16px"; // Volta ao tamanho original
              e.currentTarget.style.backgroundColor = "transparent"; // Volta ao fundo transparente
            }}
            onClick={handleLinkClick}
          >
            <Link href="/consultas/vendas">
              <a style={{ color: "white", textDecoration: "none" }}>Vendas</a>
            </Link>
          </li>

          {/** Novo item de menu para a página de relatórios */}
          <li
            style={{
              margin: "15px 0",
              cursor: "pointer",
              transition: "font-size 0.3s, background-color 0.3s", // Animação suave no tamanho da fonte e na cor de fundo
              fontSize: "16px", // Tamanho inicial da fonte
              padding: "10px", // Espaçamento interno para os itens do menu
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.fontSize = "20px"; // Aumenta a fonte ao passar o mouse
              e.currentTarget.style.backgroundColor = "#0056b3"; // Muda a cor de fundo ao passar o mouse
              e.currentTarget.style.fontWeight = "bold"; // Deixa o texto em negrito
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.fontSize = "16px"; // Volta ao tamanho original
              e.currentTarget.style.backgroundColor = "transparent"; // Volta ao fundo transparente
            }}
            onClick={handleLinkClick}
          >
            <Link href="/relatorios">
              <a style={{ color: "white", textDecoration: "none" }}>Relatórios</a>
            </Link>
          </li>

          <li
            style={{
              margin: "15px 0",
              cursor: "pointer",
              transition: "font-size 0.3s, background-color 0.3s", // Animação suave no tamanho da fonte e na cor de fundo
              fontSize: "16px", // Tamanho inicial da fonte
              padding: "10px", // Espaçamento interno para os itens do menu
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.fontSize = "20px"; // Aumenta a fonte ao passar o mouse
              e.currentTarget.style.backgroundColor = "#0056b3"; // Muda a cor de fundo ao passar o mouse
              e.currentTarget.style.fontWeight = "bold"; // Deixa o texto em negrito
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.fontSize = "16px"; // Volta ao tamanho original
              e.currentTarget.style.backgroundColor = "transparent"; // Volta ao fundo transparente
            }}
            onClick={() => {
              handleLinkClick();
              router.push("/login"); // Redireciona para a página de login
            }}
          >
            <a style={{ color: "white", textDecoration: "none" }}>Sair</a>
          </li>
        </ul>
      </div>
    </aside>
  );
};
