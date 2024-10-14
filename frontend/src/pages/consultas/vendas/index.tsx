import React from "react";
import withAuth from "components/common/withAuth";
import { ListagemVendas as VendasList } from "components/vendas/listagem"; 

const ListagemVendasPage: React.FC = () => {
  return <VendasList />;  
};

export default withAuth(ListagemVendasPage);
