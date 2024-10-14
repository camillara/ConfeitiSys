import { httpClient } from "app/http";
import { Page } from "app/models/common/page";
import { ItemProdutoAtualizarDTO, Venda } from "app/models/vendas";
import { AxiosResponse } from "axios";
import { useUser } from "context/UserContext"; // Importa o contexto do usuário

const resourceURL = "/api/vendas";

export const useVendaService = () => {
  const { user } = useUser(); // Acessa o usuário logado do contexto

  const realizarVenda = async (venda: Venda): Promise<void> => {
    if (user) {
      console.log("Venda enviada para o backend:", venda); 
      await httpClient.post<Venda>(`${resourceURL}?userId=${user.id}`, venda); // Passa o userId
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  const find = async (
    nomeCliente: string, 
    page: number, 
    rows: number, 
    formaPagamento?: string, 
    statusPagamento?: string, 
    statusPedido?: string, 
    dataCadastroInicio?: string, 
    dataCadastroFim?: string, 
    dataEntregaInicio?: string, 
    dataEntregaFim?: string
  ): Promise<Page<Venda>> => {
    if (user) {
      // Montando a URL com os filtros opcionais e o userId
      let url = `${resourceURL}?nomeCliente=${nomeCliente}&page=${page}&size=${rows}&userId=${user.id}`;
      
      if (formaPagamento) url += `&formaPagamento=${formaPagamento}`;
      if (statusPagamento) url += `&statusPagamento=${statusPagamento}`;
      if (statusPedido) url += `&statusPedido=${statusPedido}`;
      if (dataCadastroInicio) url += `&dataCadastroInicio=${dataCadastroInicio}`;
      if (dataCadastroFim) url += `&dataCadastroFim=${dataCadastroFim}`;
      if (dataEntregaInicio) url += `&dataEntregaInicio=${dataEntregaInicio}`;
      if (dataEntregaFim) url += `&dataEntregaFim=${dataEntregaFim}`;
    
      // Faz a requisição e retorna os dados
      const response: AxiosResponse<Page<Venda>> = await httpClient.get(url);
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };
  
  const buscarPorId = async (id: number): Promise<Venda> => {
    if (user) {
      const response: AxiosResponse<Venda> = await httpClient.get(`${resourceURL}/${id}?userId=${user.id}`);
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  const deletar = async (id: number): Promise<AxiosResponse<void>> => {
    if (user) {
      return await httpClient.delete(`${resourceURL}/${id}?userId=${user.id}`);
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  const listarItensPorVenda = async (idVenda: number): Promise<ItemProdutoAtualizarDTO[]> => {
    if (user) {
      const response: AxiosResponse<ItemProdutoAtualizarDTO[]> = await httpClient.get(`${resourceURL}/${idVenda}/itens-produto?userId=${user.id}`);
      return response.data;
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  const atualizarVenda = async (id: number, vendaAtualizadaDTO: Venda): Promise<void> => {
    if (user) {
      await httpClient.put<Venda>(`${resourceURL}/${id}?userId=${user.id}`, vendaAtualizadaDTO);
    } else {
      throw new Error("Usuário não autenticado");
    }
  };

  return {
    realizarVenda,
    find,
    buscarPorId,
    deletar,
    listarItensPorVenda,
    atualizarVenda, 
  };
};
