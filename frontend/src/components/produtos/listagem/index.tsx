import { Layout, Loader } from "components";
import Link from "next/link";
import Router from "next/router";
import { TabelaProdutos } from "./tabela";
import { Produto } from "app/models/produtos";
import useSWR from "swr";
import { httpClient } from "app/http";
import { AxiosResponse } from "axios";
import { useProdutoService } from "app/services";
import { Alert } from "components/common/message";
import { useState, useEffect } from "react";

export const ListagemProdutos: React.FC = () => {
  const service = useProdutoService();
  const [messages, setMessages] = useState<Array<Alert>>([]);

  const { data: result, error } = useSWR<AxiosResponse<Produto[]>>(
    "/api/produtos",
    (url) => httpClient.get(url)
  );

  const [lista, setLista] = useState<Produto[]>([]);

  useEffect(() => {
    setLista(result?.data || []);
  }, [result]);

  const editar = (produto: Produto) => {
    const url = `/cadastros/produtos?id=${produto.id}`;
    Router.push(url);
  };

  const deletar = async (produto: Produto) => {
    try {
      await service.deletar(produto.id);
      // Se não houve erro, atualiza a lista
      const listaAlterada: Produto[] = lista?.filter((p) => p.id !== produto.id);
      setLista(listaAlterada);
    } catch (error) {
      // Lança a exceção para que o toast de erro a capture
      throw error;
    }
  };
  
  
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => setMessages([]), 5000); // Limpa as mensagens após 5 segundos
      return () => clearTimeout(timer); // Limpa o timer caso o componente seja desmontado
    }
  }, [messages]);

  return (
    <Layout titulo="PRODUTOS" mensagens={messages}>
      <Link href="/cadastros/produtos">
        <button className="button is-warning">Novo</button>
      </Link>
      <br />
      <br />
      <Loader show={!result} />
      <TabelaProdutos onEdit={editar} onDelete={deletar} produtos={lista} />
    </Layout>
  );
};
