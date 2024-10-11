import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";

interface MenuItemProps {
  href: string;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ href, label }) => {
  return (
    <li>
      <Link href={href}>
        <a>{label}</a>
      </Link>
    </li>
  );
};

const MenuContainer = styled.aside<{ isMenuOpen: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: ${(props) => (props.isMenuOpen ? "250px" : "0")};
  transition: width 0.3s ease;
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuList = styled.ul<{ isMenuOpen: boolean }>`
  display: ${(props) => (props.isMenuOpen ? "block" : "none")};
`;

const ToggleButton = styled.button`
  border: none;
  background: none;
  font-size: 24px;
`;

export const Menu: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <MenuContainer isMenuOpen={isMenuOpen}>
      <MenuHeader>
        <p>Menu ConfeitiSys</p>
        <ToggleButton onClick={toggleMenu}>
          <span className="icon">
            <i className={`fas fa-${isMenuOpen ? "times" : "bars"}`}></i>
          </span>
        </ToggleButton>
      </MenuHeader>
      <MenuList isMenuOpen={isMenuOpen}>
        <MenuItem href="/" label="Home" />
        <MenuItem href="/consultas/produtos" label="Produtos" />
        <MenuItem href="/consultas/clientes" label="Clientes" />
        <MenuItem href="/vendas/nova-venda" label="Venda" />
        <MenuItem href="/" label="Sair" />
      </MenuList>
    </MenuContainer>
  );
};
