import { httpClient } from "app/http";
import { Page } from "app/models/common/page";
import { ItemProdutoAtualizarDTO, Venda } from "app/models/vendas";
import { AxiosResponse } from "axios";

const resourceURL = "/api/vendas";

export const useVendaService = () => {
  const realizarVenda = async (venda: Venda): Promise<void> => {
    console.log("Venda enviada para o backend:", venda); 
    
    await httpClient.post<Venda>(resourceURL, venda);
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
    
    // Montando a URL com os filtros opcionais
    let url = `${resourceURL}?nomeCliente=${nomeCliente}&page=${page}&size=${rows}`;
    
    // Adiciona os parâmetros de filtro à URL se estiverem definidos
    if (formaPagamento) {
      url += `&formaPagamento=${formaPagamento}`;
    }
    if (statusPagamento) {
      url += `&statusPagamento=${statusPagamento}`;
    }
    if (statusPedido) {
      url += `&statusPedido=${statusPedido}`;
    }
    if (dataCadastroInicio) {
      url += `&dataCadastroInicio=${dataCadastroInicio}`;
    }
    if (dataCadastroFim) {
      url += `&dataCadastroFim=${dataCadastroFim}`;
    }
    if (dataEntregaInicio) {
      url += `&dataEntregaInicio=${dataEntregaInicio}`;
    }
    if (dataEntregaFim) {
      url += `&dataEntregaFim=${dataEntregaFim}`;
    }
  
    // Faz a requisição e retorna os dados
    const response: AxiosResponse<Page<Venda>> = await httpClient.get(url);
    return response.data;
  };
  
    // Nova função para buscar a venda por ID
    const buscarPorId = async (id: number): Promise<Venda> => {
      const response: AxiosResponse<Venda> = await httpClient.get(`${resourceURL}/${id}`);
      return response.data;
    };

  const deletar = async (id: number): Promise<AxiosResponse<void>> => {
    return await httpClient.delete(`${resourceURL}/${id}`);
  };

    // Nova função para listar os itens de venda relacionados a um idVenda
    const listarItensPorVenda = async (idVenda: number): Promise<ItemProdutoAtualizarDTO[]> => {
      const response: AxiosResponse<ItemProdutoAtualizarDTO[]> = await httpClient.get(`${resourceURL}/${idVenda}/itens-produto`);
      return response.data;
    };

  return {
    realizarVenda,
    find,
    buscarPorId,
    deletar,
    listarItensPorVenda,
  };
}