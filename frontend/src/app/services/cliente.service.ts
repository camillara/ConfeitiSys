import { httpClient } from "app/http";
import { Cliente } from "app/models/clientes";
import { AxiosResponse } from "axios";
import { Page } from "app/models/common/page";
import { useUser } from "context/UserContext"; // Importa o contexto do usuário

const resourceURL: string = "/api/clientes";

export const useClienteService = () => {
  const { user } = useUser(); // Acessa o usuário logado

  const salvar = async (cliente: Cliente): Promise<Cliente> => {
    if (user) {
      // Inclui o id do usuário logado no payload ou na URL, conforme necessário
      const response: AxiosResponse<Cliente> = await httpClient.post<Cliente>(
        `${resourceURL}?userId=${user.id}`, // Passa o id do usuário na URL
        cliente
      );
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  const atualizar = async (cliente: Cliente): Promise<void> => {
    if (user) {
      const url: string = `${resourceURL}/${cliente.id}?userId=${user.id}`;
      await httpClient.put<Cliente>(url, cliente);
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  const carregarCliente = async (id: any): Promise<Cliente> => {
    if (user) {
      const url: string = `${resourceURL}/${id}?userId=${user.id}`;
      const response: AxiosResponse<Cliente> = await httpClient.get(url);
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  const deletar = async (id: any): Promise<AxiosResponse<void>> => {
    if (user) {
      const url: string = `${resourceURL}/${id}?userId=${user.id}`;
      return await httpClient.delete(url); // Retorna a resposta completa
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  const find = async (
    nome: string = "",
    p0: string,
    page: number = 0,
    size: number = 10
  ): Promise<Page<Cliente>> => {
    if (user) {
      const url = `${resourceURL}?nome=${nome}&page=${page}&size=${size}&userId=${user.id}`;
      const response: AxiosResponse<Page<Cliente>> = await httpClient.get(url);
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  return {
    salvar,
    atualizar,
    carregarCliente,
    deletar,
    find,
  };
};
