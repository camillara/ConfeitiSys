import { Produto } from "app/models/produtos";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import React, { useRef } from "react";
import { Toast } from "primereact/toast";

interface TabelaProdutosProps {
  produtos: Array<Produto>;
  onEdit: (produto: Produto) => void;
  onDelete: (produto: Produto) => Promise<void>;
}

export const TabelaProdutos: React.FC<TabelaProdutosProps> = ({
  produtos,
  onDelete,
  onEdit,
}: TabelaProdutosProps) => {
  const toast = useRef<any>(null);

  const actionTemplate = (registro: Produto) => {
    const accept = async () => {
      try {
        await onDelete(registro);
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto DELETADO com sucesso!",
          life: 3000,
        });
      } catch (error) {
        const mensagemErro = (error as any).response?.data || "Erro ao excluir o produto!";
        toast.current.show({
          severity: "error",
          summary: "Erro",
          detail: mensagemErro,
          life: 5000,
        });
      }
    };

    const reject = () => {
      toast.current.show({
        severity: "warn",
        summary: "Cancelado",
        detail: "Ação de exclusão cancelada",
        life: 10000,
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

  return (
    <DataTable value={produtos} paginator rows={5} responsiveLayout="scroll">
      <Column field="id" header="Código" />
      <Column field="categoria" header="Categoria" />
      <Column field="nome" header="Nome" />
      <Column field="tipo" header="Tipo" />
      <Column field="preco" header="Preço" />
      <Column body={actionTemplate} header="Ações" />
    </DataTable>
  );
};
