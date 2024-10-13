import React from "react";
import withAuth from "components/common/withAuth";
import { ListagemClientes as ClientesList } from "components/clientes";  

const ListagemClientesPage: React.FC = () => {
  return <ClientesList />;  
};

export default withAuth(ListagemClientesPage);  
