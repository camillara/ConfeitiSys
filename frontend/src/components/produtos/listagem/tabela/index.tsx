import { Produto } from "app/models/produtos";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import React from "react";

const categoriaMap: Record<string, string> = {
  MATERIA_PRIMA: "Matéria Prima",
  BOLO: "Bolo",
  DOCE: "Doce",
  QUITANDA: "Quitanda",
  TORTA: "Torta",
  SOBREMESA: "Sobremesa",
  BEBIDA: "Bebida",
  CUPCAKE_MUFFIN: "Cupcake/Muffin",
  SALGADO: "Salgado",
  RECHEIO_COBERTURA: "Recheio/Cobertura",
  UTENSILIO_EMBALAGEM: "Utensílio/Embalagem",
};

// Função para formatar a categoria
const formatCategoria = (categoria: string) => {
  return categoriaMap[categoria] || categoria;
};

// Função para formatar o número com separador de vírgula
const formatNumber = (value: number) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface TabelaProdutosProps {
  produtos: Array<Produto>;
  onEdit: (produto: Produto) => void;
  onDelete: (produto: Produto) => Promise<void>;
  totalRecords: number;
  rows: number;
  first: number;
  onPage: (event: any) => void;
  loading: boolean;
}

export const TabelaProdutos: React.FC<TabelaProdutosProps> = ({
  produtos,
  onDelete,
  onEdit,
  totalRecords,
  rows,
  first,
  onPage,
  loading,
}: TabelaProdutosProps) => {
  const actionTemplate = (registro: Produto) => {
    const accept = async () => {
      try {
        await onDelete(registro);
      } catch (error) {
        console.error("Erro ao excluir o produto:", error);
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

  // Template para o campo de preço, com R$ à esquerda e valor alinhado à direita
  const precoTemplate = (rowData: Produto) => {
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
          {formatNumber(rowData.preco)}
        </span>
      </div>
    );
  };

  return (
    <DataTable
      value={produtos}
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

      <Column field="nome" header="Nome" />
      <Column
        field="categoria"
        header="Categoria"
        body={(rowData: Produto) => formatCategoria(rowData.categoria)}
      />
      <Column field="tipo" header="Tipo" />
      <Column
        field="preco"
        header="Preço"
        body={precoTemplate}
        style={{ textAlign: "right" }}
      />
      <Column body={actionTemplate} header="" />
    </DataTable>
  );
};
