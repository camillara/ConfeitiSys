import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "context/UserContext"; // Importa o contexto de usuário

export const Menu: React.FC = () => {
  const { user, setUser } = useUser();  // Acessa o usuário e a função para atualizar o contexto
  const router = useRouter();

  const handleLogout = () => {
    setUser(null);  // Limpa o contexto de usuário
    router.push("/login");  // Redireciona para a página de login
  };

  // Se não houver usuário logado, não exibe o menu
  if (!user) {
    return null;
  }

  return (
    <aside className="column is-2 is-narrow-mobile is-fullheight section is-hidden-mobile">
      <p className="menu-label is-hidden-touch">Menu ConfeitiSys</p>
      <ul className="menu-list">
        <MenuItem href="/" label="Home" />
        <MenuItem href="/consultas/produtos" label="Produtos" />
        <MenuItem href="/consultas/clientes" label="Clientes" />
        <MenuItem href="/consultas/vendas" label="Vendas" />
        <li>
          <a onClick={handleLogout}>Sair</a> {/* Ação de logout */}
        </li>
      </ul>
    </aside>
  );
};

interface MenuItemProps {
  href: string;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = (props: MenuItemProps) => {
  return (
    <li>
      <Link href={props.href}>
        <a>
          <span className="icon"></span>
          {props.label}
        </a>
      </Link>
    </li>
  );
};
