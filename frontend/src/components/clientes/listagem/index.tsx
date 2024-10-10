import { Cliente } from "app/models/clientes";
import { Page } from "app/models/common/page";
import { useClienteService } from "app/services";
import { Input, Layout } from "components";
import { useFormik } from "formik";
import Router from "next/router";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { DataTable, DataTablePageParams } from "primereact/datatable";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

interface ConsultaClientesForm {
  nome?: string;
}

export const ListagemClientes: React.FC = () => {
  const service = useClienteService();
  const [loading, setLoading] = useState<boolean>(false);
  const [clientes, setClientes] = useState<Page<Cliente>>({
    content: [],
    first: 0,
    number: 0,
    size: 10,
    totalElements: 0,
  });

  const handleSubmit = (filtro: ConsultaClientesForm) => {
    handlePage(null!);
  };

  const {
    handleSubmit: formikSubmit,
    values: filtro,
    handleChange,
  } = useFormik<ConsultaClientesForm>({
    onSubmit: handleSubmit,
    initialValues: { nome: "" },
  });

  const handlePage = (event: DataTablePageParams) => {
    setLoading(true);
    service
      .find(filtro.nome, event?.page, event?.rows)
      .then((result) => {
        setClientes({ ...result, first: event?.first });
      })
      .finally(() => setLoading(false));
  };

  const deletar = (cliente: Cliente) => {
    service.deletar(cliente.id).then(() => {
      handlePage(null!);
    });
  };

  const toast = useRef<any>(null);

  const actionTemplate = (registro: Cliente) => {
    const url = `/cadastros/clientes?id=${registro.id}`;

    const accept = () => {
      toast.current.show({
        severity: "info",
        summary: "Mensagem",
        detail: "Cliente DELETADO com sucesso!",
        life: 3000,
      });
      deletar(registro);
    };

    const reject = () => {
      toast.current.show({
        severity: "warn",
        summary: "Mensagem",
        detail: "Cliente NÃO Deletado!",
        life: 3000,
      });
    };

    const confirmacaoDeletar = (event: { currentTarget: any }) => {
      confirmPopup({
        target: event.currentTarget,
        message: "Confirma a exclusão deste registro?",
        icon: "pi pi-info-circle",
        acceptClassName: "p-button-danger",
        acceptLabel: "Sim",
        rejectLabel: "Não",
        accept,
        reject,
      });
    };

    return (
      <div className="field is-grouped" style={{ justifyContent: "center" }}>
        <Toast ref={toast} />
        <ConfirmPopup />

        <div className="control" style={{ marginRight: "8px" }}>
          <Button
            onClick={() => Router.push(url)}
            icon="pi pi-pencil"
            label="Editar"
            className="p-button-text"
            style={{
              width: "120px", 
              backgroundColor: "#2196F3", 
              color: "#ffffff", 
              borderRadius: "4px", 
            }}
          />
        </div>
        <div className="control">
          <Button
            onClick={confirmacaoDeletar}
            icon="pi pi-trash"
            label="Deletar"
            className="p-button-text"
            style={{
              width: "120px", 
              backgroundColor: "#f70202", 
              color: "#ffffff", 
              borderRadius: "4px", 
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Layout titulo="CLIENTES">
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
              style={{
                fontSize: "14px", 
                fontWeight: "bold", 
                width: "150px", 
                height: "38px", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                color: "#FFFFFF", 
              }}
              onClick={() => Router.push("/cadastros/clientes")}
            />
          </div>
          <div className="control">
            <button
              type="submit"
              className="button is-link"
              style={{
                fontSize: "14px", 
                fontWeight: "bold", 
                width: "150px", 
                height: "38px", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                color: "#FFFFFF", 
              }}
            >
              <i className="pi pi-search" style={{ marginRight: "8px" }}></i>
              Consultar
            </button>
          </div>
        </div>
      </form>

      <br />

      <div className="columns is-full" style={{ overflowX: "auto" }}>
        <div className="is-full" style={{ width: "100%" }}>
          <DataTable
            value={clientes.content}
            totalRecords={clientes.totalElements}
            lazy
            paginator
            first={clientes.first}
            rows={clientes.size}
            onPage={handlePage}
            loading={loading}
            emptyMessage="Nenhum registro."
            responsiveLayout="scroll" // Garante a responsividade
          >
            <Column field="id" header="Código" style={{ width: '10%' }} />
            <Column field="nome" header="Nome" style={{ width: '30%' }} />
            <Column field="email" header="Email" style={{ width: '40%' }} />
            <Column
              body={actionTemplate}
              header="Ações"
              style={{ width: '20%', textAlign: 'center' }}
            />
          </DataTable>
        </div>
      </div>
    </Layout>
  );
};
