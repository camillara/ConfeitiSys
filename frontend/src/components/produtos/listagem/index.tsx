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
import { Toast } from "primereact/toast";
import Select from "react-select";

interface ConsultaProdutosForm {
  nome?: string;
  categoria?: string;
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
  const [produtosFiltrados, setProdutosFiltrados] = useState<Array<Produto>>([]);
  const toast = useRef<Toast>(null);

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

  useEffect(() => {
    carregarProdutos("", "", 0, 5);
  }, []);

  const carregarProdutos = (nome: string, categoria: string, page: number, rows: number) => {
    setLoading(true);
    service
      .find(nome, categoria, page, rows)
      .then((result) => {
        setProdutos(result);
        setProdutosFiltrados(result.content);
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

  const handleSubmit = (filtro: ConsultaProdutosForm) => {
    carregarProdutos(filtro.nome || "", filtro.categoria || "", 0, produtos.size);
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange, setFieldValue, resetForm } = useFormik<ConsultaProdutosForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "", categoria: "" },
  });

  const handlePage = (event: DataTablePageParams) => {
    carregarProdutos(filtro.nome || "", filtro.categoria || "", event.page, event.rows);
  };

  // Atualizado: Limpa os filtros e carrega os produtos com filtros vazios, sem recarregar a página
  const limparFiltro = () => {
    resetForm();  // Redefine os campos do formulário para os valores iniciais
    carregarProdutos("", "", 0, produtos.size);  // Recarrega os produtos com os filtros vazios
  };

  const editar = (produto: Produto) => {
    const url = `/cadastros/produtos?id=${produto.id}`;
    Router.push(url);
  };

  const deletar = async (produto: Produto) => {
    try {
      const response = await service.deletar(produto.id);
      if (response.status >= 200 && response.status < 300) {
        carregarProdutos(filtro.nome || "", filtro.categoria || "", produtos.number, produtos.size);
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

  const buttonStyle = {
    fontSize: "14px", 
    fontWeight: "bold", 
    width: "150px", 
    height: "38px", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    color: "#FFFFFF", 
  };

  return (
    <Layout titulo="PRODUTOS">
      <Toast ref={toast} />
      <form onSubmit={formikSubmit}>
        <div
          className="columns"
          style={{
            marginBottom: "1rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 2, marginRight: "1rem", minWidth: "250px" }}>
            <Input
              label="Nome"
              id="nome"
              columnClasses="is-full"
              autoComplete="on"
              onChange={handleChange}
              name="nome"
              value={filtro.nome}
              placeholder="Digite o nome do produto"
            />
          </div>

          <div style={{ flex: 1, minWidth: "250px" }}>
            <label className="label">Categoria</label>
            <Select
              id="categoria"
              options={categorias}
              value={categorias.find((cat) => cat.value === filtro.categoria)}
              onChange={(option) => setFieldValue("categoria", option?.value || "")}
              placeholder="Selecione uma categoria"
              isClearable
            />
          </div>
        </div>

        <div
          className="field is-grouped"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px", // Espaçamento entre os botões
          }}
        >
          <div className="control">
            <Button
              label="Novo"
              icon="pi pi-plus"
              className="p-button-success"
              style={buttonStyle}
              onClick={() => Router.push("/cadastros/produtos")}
            />
          </div>
          <div className="control">
            <button
              type="submit"
              className="button is-link"
              style={{
                ...buttonStyle,
              }}
            >
              <i className="pi pi-search" style={{ marginRight: "8px" }}></i>
              Consultar
            </button>
          </div>

          <div className="control">
            <Button
              label="Limpar Filtro"
              icon="pi pi-filter-slash"
              className="p-button-secondary"
              style={{
                ...buttonStyle, 
                backgroundColor: "#6c757d", 
                border: "none",
              }}
              onClick={limparFiltro}
            />
          </div>
        </div>
      </form>

      <br />

      <div className="columns">
        <div className="is-full" style={{ width: "100%" }}>
          <TabelaProdutos
            produtos={produtosFiltrados}
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
