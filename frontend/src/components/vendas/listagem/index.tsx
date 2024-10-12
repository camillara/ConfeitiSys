import { Layout } from "components";
import Router from "next/router";
import { TabelaVendas } from "./tabela";
import { Venda } from "app/models/vendas";
import { useVendaService } from "app/services";
import { useState, useEffect, useRef } from "react";
import { Input } from "components";
import { useFormik } from "formik";
import { DataTablePageParams } from "primereact/datatable";
import { Button } from "primereact/button";
import { Page } from "app/models/common/page";
import { Toast } from "primereact/toast";

interface ConsultaVendasForm {
  nomeCliente?: string;
}

export const ListagemVendas: React.FC = () => {
  const service = useVendaService();
  const [loading, setLoading] = useState<boolean>(false);
  const [vendas, setVendas] = useState<Page<Venda>>({
    content: [],
    first: 0,
    number: 0,
    size: 5,
    totalElements: 0,
  });
  const [vendasFiltradas, setVendasFiltradas] = useState<Array<Venda>>([]);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    carregarVendas("", 0, 5);
  }, []);

  const carregarVendas = (nomeCliente: string, page: number, rows: number) => {
    setLoading(true);
    service
      .find(nomeCliente, page, rows)
      .then((result) => {
        setVendas(result);
        setVendasFiltradas(result.content);
      })
      .catch((error) => {
        if (toast.current) {
          toast.current.show({
            severity: "error",
            summary: "Erro ao carregar vendas",
            detail: "Houve um problema ao carregar a lista de vendas.",
            life: 3000,
          });
        }
        console.error("Erro ao carregar vendas:", error);
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = (filtro: ConsultaVendasForm) => {
    carregarVendas(filtro.nomeCliente || "", 0, vendas.size);
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange } = useFormik<ConsultaVendasForm>({
    onSubmit: handleSubmit,
    initialValues: { nomeCliente: "" },
  });

  const handlePage = (event: DataTablePageParams) => {
    carregarVendas(filtro.nomeCliente || "", event.page, event.rows);
  };

  const limparFiltro = () => {
    window.location.reload();
  };

  const editar = (venda: Venda) => {
    const url = `/cadastros/vendas?id=${venda.id}`;
    Router.push(url);
  };

  const deletar = async (venda: Venda) => {
    try {
      await service.deletar(venda.id);
      carregarVendas(filtro.nomeCliente || "", vendas.number, vendas.size);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Venda deletada com sucesso.",
        life: 3000,
      });
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erro ao deletar",
        detail: error.response?.data || "Não foi possível deletar a venda.",
        life: 5000,
      });
      console.error("Erro ao deletar venda:", error);
    }
  };

  return (
    <Layout titulo="VENDAS">
      <Toast ref={toast} />
      <form onSubmit={formikSubmit}>
        <div className="columns" style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap" }}>
          <div style={{ flex: 2, marginRight: "1rem", minWidth: "250px" }}>
            <Input
              label="Nome do Cliente"
              id="nomeCliente"
              columnClasses="is-full"
              autoComplete="on"
              onChange={handleChange}
              name="nomeCliente"
              value={filtro.nomeCliente}
              placeholder="Digite o nome do cliente"
            />
          </div>
        </div>

        <div className="field is-grouped" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <div className="control">
            <Button
              label="Nova Venda"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={() => Router.push("/cadastros/vendas")}
            />
          </div>
          <div className="control">
            <button type="submit" className="button is-link">
              <i className="pi pi-search" style={{ marginRight: "8px" }}></i>
              Consultar
            </button>
          </div>
          <div className="control">
            <Button
              label="Limpar Filtro"
              icon="pi pi-filter-slash"
              className="p-button-secondary"
              onClick={limparFiltro}
            />
          </div>
        </div>
      </form>

      <br />

      <div className="columns">
        <div className="is-full" style={{ width: "100%" }}>
          <TabelaVendas
            vendas={vendasFiltradas}
            onEdit={editar}
            onDelete={deletar}
            totalRecords={vendas.totalElements}
            first={vendas.first}
            rows={vendas.size}
            onPage={handlePage}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};
