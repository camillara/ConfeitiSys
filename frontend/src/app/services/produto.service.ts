import { httpClient } from "app/http";
import { Produto } from "app/models/produtos";
import { AxiosResponse } from "axios";
import { Page } from "app/models/common/page";
import { useUser } from "context/UserContext"; // Importa o contexto do usuário

const resourceURL: string = "/api/produtos";

export const useProdutoService = () => {
  const { user } = useUser(); // Acessa o usuário logado do contexto

  // Método para salvar um novo produto
  const salvar = async (produto: Produto): Promise<Produto> => {
    if (user) {
      const response: AxiosResponse<Produto> = await httpClient.post<Produto>(
        `${resourceURL}?userId=${user.id}`, // Inclui o id do usuário na URL
        produto
      );
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  // Método para atualizar um produto existente
  const atualizar = async (produto: Produto): Promise<void> => {
    if (user) {
      const url: string = `${resourceURL}/${produto.id}?userId=${user.id}`;
      await httpClient.put<Produto>(url, produto);
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  // Método para carregar um produto pelo ID
  const carregarProduto = async (id: any): Promise<Produto> => {
    if (user) {
      const url: string = `${resourceURL}/${id}?userId=${user.id}`;
      const response: AxiosResponse<Produto> = await httpClient.get(url);
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  // Método para deletar um produto pelo ID
  const deletar = async (id: any): Promise<void> => {
    if (user) {
      const url: string = `${resourceURL}/${id}?userId=${user.id}`;
      return await httpClient.delete(url);
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  // Método para listar todos os produtos
  const listar = async (): Promise<Produto[]> => {
    if (user) {
      const response: AxiosResponse<Produto[]> = await httpClient.get(
        `${resourceURL}?userId=${user.id}`
      );
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  // Método para consultar produtos por nome, com paginação
  const find = async (nome: string = "", categoria: string = "", page: number = 0, size: number = 10): Promise<Page<Produto>> => {
    if (user) {
      let url = `${resourceURL}/filtrar?nome=${nome}&page=${page}&size=${size}&userId=${user.id}`;

      // Adiciona o filtro de categoria na URL caso esteja presente
      if (categoria) {
        url += `&categoria=${categoria}`;
      }

      const response: AxiosResponse<Page<Produto>> = await httpClient.get(url);
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
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
