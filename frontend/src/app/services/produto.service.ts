import { httpClient } from "app/http";
import { Produto } from "app/models/produtos";
import { AxiosResponse } from "axios";
import { Page } from "app/models/common/page"; 

const resourceURL: string = "/api/produtos";

export const useProdutoService = () => {
  // Método para salvar um novo produto
  const salvar = async (produto: Produto): Promise<Produto> => {
    const response: AxiosResponse<Produto> = await httpClient.post<Produto>(
      resourceURL,
      produto
    );
    return response.data;
  };

  // Método para atualizar um produto existente
  const atualizar = async (produto: Produto): Promise<void> => {
    const url: string = `${resourceURL}/${produto.id}`;
    await httpClient.put<Produto>(url, produto);
  };

  // Método para carregar um produto pelo ID
  const carregarProduto = async (id: any): Promise<Produto> => {
    const url: string = `${resourceURL}/${id}`;
    const response: AxiosResponse<Produto> = await httpClient.get(url);
    return response.data;
  };

  // Método para deletar um produto pelo ID
  const deletar = async (id: any): Promise<void> => {
    const url: string = `${resourceURL}/${id}`;
    return await httpClient.delete(url); 
  };

  // Método para listar todos os produtos
  const listar = async (): Promise<Produto[]> => {
    const response: AxiosResponse<Produto[]> = await httpClient.get(
      resourceURL
    );
    return response.data;
  };

  // Método para consultar produtos por nome, com paginação
  const find = async (nome: string = "", page: number = 0, size: number = 10): Promise<Page<Produto>> => {
    const url = `${resourceURL}/filtrar?nome=${nome}&page=${page}&size=${size}`;
    const response: AxiosResponse<Page<Produto>> = await httpClient.get(url);
    return response.data;
  };

  return {
    salvar,
    atualizar,
    carregarProduto,
    deletar,
    listar,
    find, 
  };
};
