import { Cliente } from "../clientes";
import { Produto } from "../produtos";

export interface Venda {
  cliente?: Cliente;
  itens?: Array<ItemVenda>;
  formaPagamento?: string;
  statusPagamento?: string;
  statusPedido?: string;
  total: number;
  cadastro?: string;
  dataEntrega?: string;
}

export interface ItemVenda {
  produto: Produto;
  quantidade: number;
}
