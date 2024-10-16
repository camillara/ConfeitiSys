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
  observacao?: string;
}

export interface ItemVenda {
  produto: Produto;
  quantidade: number;
}

export interface ItemProdutoAtualizarDTO {
  produtoId: number;
  categoria: string;
  nome: string;
  tipo: string;
  precoUnitario: number;
  qtd: number;
  total: number;
}

export interface PedidosProducao {
  id?: number; 
  nomeCliente?: string;
  nomeProduto?: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
  total: number;
  dataEntrega?: string;
}

export interface VendasPorStatus{
  formaPagamento?: string;
  totalPagas?: number;
  totalPendentes?: number;
  valorTotal?: number;
}