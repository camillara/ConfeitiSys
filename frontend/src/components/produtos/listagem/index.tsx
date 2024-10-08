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
import { Page } from "app/models/common/page"; 

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
    size: 5, // Definido como 5 para manter a paginação em 5 itens por página
    totalElements: 0,
  });

  useEffect(() => {
    setLoading(true);
    service
      .find("", 0, 5) // Carrega 5 produtos por página inicialmente
      .then((result) => {
        setProdutos(result); // Não altere o tamanho da página dinamicamente
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (filtro: ConsultaProdutosForm) => {
    handlePage({ first: 0, page: 0, rows: produtos.size });
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaProdutosForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  const handlePage = (event: DataTablePageParams) => {
    setLoading(true);
    service
      .find(filtro.nome || "", event.page, event.rows) // Sempre busca com paginação, respeitando o filtro e número de linhas por página
      .then((result) => {
        setProdutos({ ...result, first: event.first });
      })
      .finally(() => setLoading(false));
  };

  const editar = (produto: Produto) => {
    const url = `/cadastros/produtos?id=${produto.id}`;
    Router.push(url);
  };

  const deletar = async (produto: Produto) => {
    try {
      await service.deletar(produto.id);
      handlePage({ first: produtos.first, page: produtos.number, rows: produtos.size });
    } catch (error) {
      // Erro ao deletar
    }
  };

  return (
    <Layout titulo="PRODUTOS">
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

      <div className="columns">
        <div className="is-full" style={{ width: "100%" }}>
          <TabelaProdutos
            produtos={produtos.content}
            onEdit={editar}
            onDelete={deletar}
            totalRecords={produtos.totalElements}
            lazy
            paginator
            first={produtos.first}
            rows={produtos.size} // Mantém 5 registros por página
            onPage={handlePage}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};
