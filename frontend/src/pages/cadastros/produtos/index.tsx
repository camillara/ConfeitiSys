import React from "react";
import withAuth from "components/common/withAuth";
import { CadastroProdutos as ProdutosForm } from "components"; 

const CadastroProdutosPage: React.FC = () => {
  return <ProdutosForm />;  
};

export default withAuth(CadastroProdutosPage);
