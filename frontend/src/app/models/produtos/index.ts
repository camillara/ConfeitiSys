export interface Produto {
  id?: string;
  nome?: string;
  descricao?: string;
  preco?: number;
  categoria?: string;
  tipo?: string;
  cadastro?: string;
  itensProduto?: ItensProduto[];
}

export interface ItensProduto {
  id?: number;
  quantidade?: number;
  produtoId?: number;
  itemProdutoId?: number;
}