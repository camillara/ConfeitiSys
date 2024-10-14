import React from "react";
import withAuth from "components/common/withAuth";
import { Vendas as VendasForm } from "components"; 

const VendasPage: React.FC = () => {
  return <VendasForm />;  
};

export default withAuth(VendasPage);
