import { httpClient } from "app/http";
import { Page } from "app/models/common/page";
import { Venda } from "app/models/vendas";
import { AxiosResponse } from "axios";

const resourceURL = "/api/vendas";

export const useVendaService = () => {
  const realizarVenda = async (venda: Venda): Promise<void> => {
    console.log("Venda enviada para o backend:", venda); 
    
    await httpClient.post<Venda>(resourceURL, venda);
  };

  const find = async (nomeCliente: string, page: number, rows: number): Promise<Page<Venda>> => {
    const response: AxiosResponse<Page<Venda>> = await httpClient.get(
      `${resourceURL}?nomeCliente=${nomeCliente}&page=${page}&size=${rows}`
    );
    return response.data;
  };
  

  const deletar = async (id: number): Promise<AxiosResponse<void>> => {
    return await httpClient.delete(`${resourceURL}/${id}`);
  };

  return {
    realizarVenda,
    find,
    deletar,
  };
}