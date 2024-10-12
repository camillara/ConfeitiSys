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
import Select from "react-select";
import { InputDate } from "components";  // Assumindo que você tenha um componente de data como no exemplo

interface ConsultaVendasForm {
  nomeCliente?: string;
  formaPagamento?: string;
  statusPagamento?: string;
  statusPedido?: string;
  dataCadastroInicio?: string;
  dataCadastroFim?: string;
  dataEntregaInicio?: string;
  dataEntregaFim?: string;
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

  // Opções para Select
  const formasPagamento = [
    { value: "DINHEIRO", label: "Dinheiro" },
    { value: "PIX", label: "PIX" },
    { value: "CARTAO_DE_CREDITO", label: "Cartão de Crédito" },
    { value: "CARTAO_DE_DEBITO", label: "Cartão de Débito" },
  ];

  const statusPagamento = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "PAGO", label: "Pago" },
  ];

  const statusPedido = [
    { value: "PRODUCAO", label: "Produção" },
    { value: "ENTREGUE", label: "Entregue" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

  useEffect(() => {
    carregarVendas({}, 0, 5);
  }, []);

  const carregarVendas = (filtro: ConsultaVendasForm, page: number, rows: number) => {
    setLoading(true);
    service
      .find(
        filtro.nomeCliente || "",
        page,
        rows,
        filtro.formaPagamento,
        filtro.statusPagamento,
        filtro.statusPedido,
        filtro.dataCadastroInicio,
        filtro.dataCadastroFim,
        filtro.dataEntregaInicio,
        filtro.dataEntregaFim
      )
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
    carregarVendas(filtro, 0, vendas.size);
  };

  const { handleSubmit: formikSubmit, values: filtro, handleChange, setFieldValue } = useFormik<ConsultaVendasForm>({
    onSubmit: handleSubmit,
    initialValues: {
      nomeCliente: "",
      formaPagamento: "",
      statusPagamento: "",
      statusPedido: "",
      dataCadastroInicio: "",
      dataCadastroFim: "",
      dataEntregaInicio: "",
      dataEntregaFim: "",
    },
  });

  const handlePage = (event: DataTablePageParams) => {
    carregarVendas(filtro, event.page, event.rows);
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
      carregarVendas(filtro, vendas.number, vendas.size);
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
    <Layout titulo="VENDAS">
      <Toast ref={toast} />
      <form onSubmit={formikSubmit}>
        <div
          className="columns"
          style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap" }}
        >
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

          <div style={{ flex: 1, minWidth: "250px" }}>
            <label className="label">Forma de Pagamento</label>
            <Select
              id="formaPagamento"
              options={formasPagamento}
              value={formasPagamento.find((fp) => fp.value === filtro.formaPagamento)}
              onChange={(option) => setFieldValue("formaPagamento", option?.value || "")}
              placeholder="Selecione a forma de pagamento"
              isClearable
            />
          </div>

          <div style={{ flex: 1, minWidth: "250px" }}>
            <label className="label">Status de Pagamento</label>
            <Select
              id="statusPagamento"
              options={statusPagamento}
              value={statusPagamento.find((sp) => sp.value === filtro.statusPagamento)}
              onChange={(option) => setFieldValue("statusPagamento", option?.value || "")}
              placeholder="Selecione o status de pagamento"
              isClearable
            />
          </div>

          <div style={{ flex: 1, minWidth: "250px" }}>
            <label className="label">Status do Pedido</label>
            <Select
              id="statusPedido"
              options={statusPedido}
              value={statusPedido.find((sp) => sp.value === filtro.statusPedido)}
              onChange={(option) => setFieldValue("statusPedido", option?.value || "")}
              placeholder="Selecione o status do pedido"
              isClearable
            />
          </div>
        </div>

        <div className="columns" style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <label className="label">Data de Cadastro (Início)</label>
            <InputDate
              id="dataCadastroInicio"
              name="dataCadastroInicio"
              value={filtro.dataCadastroInicio}
              onChange={handleChange}
              placeholder="Selecione a data de início"
            />
          </div>

          <div style={{ flex: 1, minWidth: "250px" }}>
            <label className="label">Data de Cadastro (Fim)</label>
            <InputDate
              id="dataCadastroFim"
              name="dataCadastroFim"
              value={filtro.dataCadastroFim}
              onChange={handleChange}
              placeholder="Selecione a data de fim"
            />
          </div>

          <div style={{ flex: 1, minWidth: "250px" }}>
            <label className="label">Data de Entrega (Início)</label>
            <InputDate
              id="dataEntregaInicio"
              name="dataEntregaInicio"
              value={filtro.dataEntregaInicio}
              onChange={handleChange}
              placeholder="Selecione a data de início"
            />
          </div>

          <div style={{ flex: 1, minWidth: "250px" }}>
            <label className="label">Data de Entrega (Fim)</label>
            <InputDate
              id="dataEntregaFim"
              name="dataEntregaFim"
              value={filtro.dataEntregaFim}
              onChange={handleChange}
              placeholder="Selecione a data de fim"
            />
          </div>
        </div>

        <div
          className="field is-grouped"
          style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
        >
          <div className="control">
            <Button
              label="Nova Venda"
              icon="pi pi-plus"
              className="p-button-success"
              style={buttonStyle}
              onClick={() => Router.push("/vendas/nova-venda")}
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
