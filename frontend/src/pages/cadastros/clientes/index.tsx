import React from "react";
import withAuth from "components/common/withAuth";
import { CadastroCliente as ClienteForm } from "components/clientes"; 

const CadastroClientePage: React.FC = () => {
  return <ClienteForm />;  
};

export default withAuth(CadastroClientePage);  
