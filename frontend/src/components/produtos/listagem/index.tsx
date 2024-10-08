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
import Select from "react-select"; // ComboBox para filtrar por categoria
import { Toast } from "primereact/toast"; // Importa o Toast para exibir notificações

interface ConsultaProdutosForm {
  nome?: string;
  categoria?: string; // Filtro para categoria
}

const categorias = [
  { value: "MATERIA_PRIMA", label: "Matéria Prima" },
  { value: "BOLO", label: "Bolo" },
  { value: "DOCE", label: "Doce" },
  { value: "QUITANDA", label: "Quitanda" },
  { value: "TORTA", label: "Torta" },
  { value: "SOBREMESA", label: "Sobremesa" },
  { value: "BEBIDA", label: "Bebida" },
  { value: "CUPCAKE_MUFFIN", label: "Cupcake/Muffin" },
  { value: "SALGADO", label: "Salgado" },
  { value: "RECHEIO_COBERTURA", label: "Recheio/Cobertura" },
  { value: "UTENSILIO_EMBALAGEM", label: "Utensílio/Embalagem" },
];

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
    carregarProdutos("", 0, 5, "");
  }, []);

  const carregarProdutos = (nome: string, page: number, rows: number, categoria: string) => {
    setLoading(true);
    service
      .find(nome, page, rows, categoria) // Chamada para a API com nome, página, tamanho e categoria
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
    carregarProdutos(filtro.nome || "", 0, produtos.size, filtro.categoria || "");
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange, setFieldValue } = useFormik<ConsultaProdutosForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "", categoria: "" },
  });

  // Função para carregar produtos com paginação e aplicar filtro de categoria
  const handlePage = (event: DataTablePageParams) => {
    carregarProdutos(filtro.nome || "", event.page, event.rows, filtro.categoria || "");
  };

  // Função para limpar os filtros e recarregar todos os produtos
  const limparFiltro = () => {
    setFieldValue("nome", "");
    setFieldValue("categoria", "");
    setProdutosFiltrados(produtos.content); // Restaura a lista completa
  };

  // Função para filtrar os produtos localmente pela categoria no frontend
  const handleCategoriaChange = (selectedOption: any) => {
    const categoriaSelecionada = selectedOption?.value || "";
    setFieldValue("categoria", categoriaSelecionada);

    // Filtrar localmente com base na categoria selecionada
    if (categoriaSelecionada) {
      const produtosFiltradosPorCategoria = produtos.content.filter(
        (produto) => produto.categoria === categoriaSelecionada
      );
      setProdutosFiltrados(produtosFiltradosPorCategoria);
    } else {
      setProdutosFiltrados(produtos.content); // Se não houver categoria, mostra todos os produtos
    }
  };

  const editar = (produto: Produto) => {
    const url = `/cadastros/produtos?id=${produto.id}`;
    Router.push(url);
  };

  const deletar = async (produto: Produto) => {
    try {
      await service.deletar(produto.id);
      carregarProdutos(filtro.nome || "", produtos.number, produtos.size, filtro.categoria || "");
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto deletado com sucesso.",
          life: 3000,
        });
      }
    } catch (error: any) {
      if (toast.current) {
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

          <div className="column is-one-quarter">
            <label className="label">Categoria</label>
            <Select
              id="categoria"
              options={categorias}
              value={categorias.find((cat) => cat.value === filtro.categoria)}
              onChange={handleCategoriaChange} // Filtro local por categoria
              placeholder="Selecione a categoria"
              isClearable
              styles={{ container: (provided) => ({ ...provided, width: "100%" }) }}
            />
          </div>
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
            produtos={produtosFiltrados} // Agora exibe os produtos filtrados localmente
            onEdit={editar}
            onDelete={deletar}
            totalRecords={produtosFiltrados.length} // Total de registros é baseado nos produtos filtrados
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
