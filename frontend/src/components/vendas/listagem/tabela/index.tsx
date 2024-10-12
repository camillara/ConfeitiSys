import { Venda } from "app/models/vendas";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import React from "react";

// Função para formatar o número com separador de vírgula
const formatNumber = (value: number) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface TabelaVendasProps {
  vendas: Array<Venda>;
  onEdit: (venda: Venda) => void;
  onDelete: (venda: Venda) => Promise<void>;
  totalRecords: number;
  rows: number;
  first: number;
  onPage: (event: any) => void;
  loading: boolean;
}

export const TabelaVendas: React.FC<TabelaVendasProps> = ({
  vendas,
  onDelete,
  onEdit,
  totalRecords,
  rows,
  first,
  onPage,
  loading,
}: TabelaVendasProps) => {
  const actionTemplate = (registro: Venda) => {
    const accept = async () => {
      try {
        await onDelete(registro);
      } catch (error) {
        console.error("Erro ao excluir a venda:", error);
      }
    };

    const reject = () => {
      console.log("Ação de exclusão cancelada");
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
        <ConfirmPopup />
        <div className="control" style={{ marginRight: "8px" }}>
          <Button
            onClick={() => onEdit(registro)}
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

  const totalTemplate = (rowData: Venda) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>R$</span>
        <span style={{ marginLeft: "auto", textAlign: "right", width: "100%" }}>
          {formatNumber(rowData.total)}
        </span>
      </div>
    );
  };

  return (
    <DataTable
      value={vendas}
      paginator
      rows={rows}
      totalRecords={totalRecords}
      first={first}
      onPage={onPage}
      loading={loading}
      responsiveLayout="scroll"
      lazy
    >
      <Column field="id" header="Código" />
      <Column field="cliente.nome" header="Cliente" />
      <Column field="formaPagamento" header="Forma de Pagamento" />
      <Column field="statusPagamento" header="Status de Pagamento" />
      <Column field="statusPedido" header="Status do Pedido" />
      <Column field="total" header="Total" body={totalTemplate} style={{ textAlign: "right" }} />
      <Column body={actionTemplate} header="" />
    </DataTable>
  );
};
