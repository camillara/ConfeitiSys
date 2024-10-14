import React from "react";
import withAuth from "components/common/withAuth";
import { ListagemProdutos as ProdutosList } from "components"; 

const ListagemProdutosPage: React.FC = () => {
  return <ProdutosList />;  
};

export default withAuth(ListagemProdutosPage);
