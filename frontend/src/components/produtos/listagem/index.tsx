import { Layout } from "components";
import Router from "next/router";
import { TabelaProdutos } from "./tabela";
import { Produto } from "app/models/produtos";
import { useProdutoService } from "app/services";
import { useState, useEffect } from "react";
import { Input } from "components";
import { useFormik } from "formik";
import { DataTablePageParams } from "primereact/datatable";
import { Button } from "primereact/button";
import { Page } from "app/models/common/page"; // Certifique-se de que a interface Page está importada

// Definimos a interface do formulário de consulta
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
    size: 10,
    totalElements: 0,
  });

  // Carregamento inicial de todos os produtos
  useEffect(() => {
    setLoading(true);
    service
      .find("", 0, 10) // Carrega todos os produtos inicialmente
      .then((result) => {
        setProdutos(result);
      })
      .finally(() => setLoading(false));
  }, []);

  // Função chamada quando o formulário de busca é submetido
  const handleSubmit = (filtro: ConsultaProdutosForm) => {
    handlePage(null!);
  };

  // Configuração do Formik para lidar com o formulário
  const {
    handleSubmit: formikSubmit,
    values: filtro,
    handleChange,
  } = useFormik<ConsultaProdutosForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  // Função para carregar produtos com paginação
  const handlePage = (event: DataTablePageParams) => {
    setLoading(true);
    service
      .find(filtro.nome || "", event?.page, event?.rows) // Se o filtro nome estiver vazio, busca todos
      .then((result) => {
        setProdutos({ ...result, first: event?.first });
      })
      .finally(() => setLoading(false));
  };

  // Função para editar um produto
  const editar = (produto: Produto) => {
    const url = `/cadastros/produtos?id=${produto.id}`;
    Router.push(url);
  };

  // Função para deletar um produto
  const deletar = async (produto: Produto) => {
    try {
      await service.deletar(produto.id);
      handlePage(null!); // Recarrega a lista de produtos após a exclusão
    } catch (error) {
      // Pode exibir um erro aqui, se necessário
    }
  };

  return (
    <Layout titulo="PRODUTOS">
      {/* Formulário de consulta por nome */}
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
        </div>
      </form>

      <br />

      {/* Tabela de produtos */}
      <div className="columns">
        <div className="is-full" style={{ width: "100%" }}> {/* Ajuste de estilo para ocupar a tela */}
          <TabelaProdutos
            produtos={produtos.content}
            onEdit={editar}
            onDelete={deletar}
            totalRecords={produtos.totalElements}
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
