import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa"; // Import dos ícones

export const Menu: React.FC = () => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false); // Estado para controlar a expansão do menu

  const toggleMenu = () => {
    setIsExpanded(!isExpanded); // Alterna o estado do menu expandido ou recolhido
  };

  return (
    <aside
      style={{
        width: isExpanded ? "200px" : "50px", // Largura de 50px quando recolhido e 200px quando expandido
        backgroundColor: isExpanded ? "#007bff" : "transparent", // Cor de fundo azul apenas quando expandido
        position: "fixed", // Menu fixo
        top: 0,
        left: 0,
        height: "auto", // Altura dinâmica de acordo com o tamanho dos itens
        paddingBottom: "10px", // Pequeno espaçamento inferior
        zIndex: 1000, // Garante que o menu fique na frente
        transition: "width 0.3s, background-color 0.3s", // Transição suave para largura e cor de fundo
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
            style={{ cursor: "pointer", color: "#007bff", fontSize: "24px" }} // Estilo do ícone de abrir
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
            color: "white", // Cor do texto branca
          }}
        >
          <li style={{ margin: "15px 0" }}>
            <Link href="/">Home</Link>
          </li>
          <li style={{ margin: "15px 0" }}>
            <Link href="/consultas/produtos">Produtos</Link>
          </li>
          <li style={{ margin: "15px 0" }}>
            <Link href="/consultas/clientes">Clientes</Link>
          </li>
          <li style={{ margin: "15px 0" }}>
            <Link href="/consultas/vendas">Vendas</Link>
          </li>
          <li
            style={{ margin: "15px 0", cursor: "pointer" }}
            onClick={() => router.push("/login")} // Função para redirecionar ao logout
          >
            Sair
          </li>
        </ul>
      </div>
    </aside>
  );
};
