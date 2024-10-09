import { Layout } from "components";
import Router from "next/router";
import { TabelaProdutos } from "./tabela";
import { Produto } from "app/models/produtos";
import { useProdutoService } from "app/services";
import { useState, useEffect, useRef } from "react";
import { Input } from "components";
import { useFormik } from "formik";
import { DataTablePageParams } from "primereact/datatable";
import { Button } from "primereact/button";
import { Page } from "app/models/common/page";
import { Toast } from "primereact/toast"; // Importa o Toast para exibir notificações

interface ConsultaProdutosForm {
  nome?: string;
}

export const ListagemProdutos: React.FC = () => {
  const service = useProdutoService();
  const [loading, setLoading] = useState<boolean>(false);
  const [produtos, setProdutos] = useState<Page<Produto>>({
    content: [],
    first: 0,
    number: 0,
    size: 5,
    totalElements: 0,
  });
  const [produtosFiltrados, setProdutosFiltrados] = useState<Array<Produto>>([]); // Lista filtrada no frontend
  const toast = useRef<Toast>(null); // Referência para o Toast

  // Carregamento inicial de todos os produtos
  useEffect(() => {
    carregarProdutos("", 0, 5);
  }, []);

  const carregarProdutos = (nome: string, page: number, rows: number) => {
    setLoading(true);
    service
      .find(nome, page, rows) // Chamada para a API com nome, página, e tamanho
      .then((result) => {
        setProdutos(result); // Atualiza os produtos no estado
        setProdutosFiltrados(result.content); // Inicializa a lista filtrada com todos os produtos
      })
      .catch((error) => {
        if (toast.current) {
          toast.current.show({
            severity: "error",
            summary: "Erro ao carregar produtos",
            detail: "Houve um problema ao carregar a lista de produtos.",
            life: 3000,
          });
        }
        console.error("Erro ao carregar produtos:", error);
      })
      .finally(() => setLoading(false));
  };

  // Função chamada quando o formulário de busca é submetido
  const handleSubmit = (filtro: ConsultaProdutosForm) => {
    carregarProdutos(filtro.nome || "", 0, produtos.size);
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaProdutosForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  // Função para carregar produtos com paginação e aplicar filtro de nome
  const handlePage = (event: DataTablePageParams) => {
    carregarProdutos(filtro.nome || "", event.page, event.rows);
  };

  // Função para limpar os filtros e recarregar a página inicial
  const limparFiltro = () => {
    window.location.reload(); // Faz um refresh na página, voltando ao estado inicial
  };

  const editar = (produto: Produto) => {
    const url = `/cadastros/produtos?id=${produto.id}`;
    Router.push(url);
  };

  const deletar = async (produto: Produto) => {
    try {
      const response = await service.deletar(produto.id);
      if (response.status >= 200 && response.status < 300) {
        carregarProdutos(filtro.nome || "", produtos.number, produtos.size);
        if (toast.current) {
          toast.current.clear();
          toast.current.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Produto deletado com sucesso.",
            life: 3000,
          });
        }
      }
    } catch (error: any) {
      if (toast.current) {
        toast.current.clear();
        toast.current.show({
          severity: "error",
          summary: "Erro ao deletar",
          detail: error.response?.data || "Não foi possível deletar o produto.",
          life: 5000,
        });
      }
      console.error("Erro ao deletar produto:", error);
    }
  };
  
  

  return (
    <Layout titulo="PRODUTOS">
      <Toast ref={toast} /> {/* Componente de Toast */}
      <form onSubmit={formikSubmit}>
        <div className="columns">
          <Input
            label="Nome"
            id="nome"
            columnClasses="is-half"
            autoComplete="off"
            onChange={handleChange}
            name="nome"
            value={filtro.nome}
          />
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button type="submit" className="button is-link">
              Consultar
            </button>
          </div>
          <div className="control">
            <Button
              label="Novo"
              className="p-button-success"
              onClick={() => Router.push("/cadastros/produtos")}
            />
          </div>
          <div className="control">
            <Button
              label="Limpar Filtro"
              className="p-button-secondary"
              onClick={limparFiltro}
            />
          </div>
        </div>
      </form>

      <br />

      <div className="columns">
        <div className="is-full" style={{ width: "100%" }}>
          <TabelaProdutos
            produtos={produtosFiltrados} // Exibe os produtos filtrados localmente
            onEdit={editar}
            onDelete={deletar}
            totalRecords={produtos.totalElements} // Total de registros agora é o total real
            lazy
            paginator
            first={produtos.first}
            rows={produtos.size}
            onPage={handlePage}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};
