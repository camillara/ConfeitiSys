import { Produto } from "app/models/produtos";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import React, { useRef, useState } from "react";
import { Toast } from "primereact/toast";

interface TabelaProdutosProps {
  produtos: Array<Produto>;
  onEdit: (produto: Produto) => void;
  onDelete: (produto: Produto) => Promise<void>; // Alterado para retornar uma Promise
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
        // Espera a execução do onDelete
        await onDelete(registro);
        // Mostra o toast de sucesso apenas se não houver erros
        toast.current.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Produto DELETADO com sucesso!",
          life: 3000,
        });
      } catch (error) {
        // Captura a mensagem de erro e mostra no toast
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
      <div className="field is-grouped">
        <Toast ref={toast} />

        <ConfirmPopup />
        <div className="control">
          <Button
            onClick={(e) => onEdit(registro)}
            label="Editar"
            className="p-button-rounded p-button-info"
          />
        </div>
        <div className="control">
          <Button
            onClick={confirmacaoDeletar}
            label="Deletar"
            className="p-button-rounded p-button-danger"
          />
        </div>
      </div>
    );
  };

  return (
    <DataTable value={produtos} paginator rows={5}>
      <Column field="id" header="Código" />
      <Column field="categoria" header="Categoria" />
      <Column field="nome" header="Nome" />
      <Column field="tipo" header="Tipo" />
      <Column field="preco" header="Preço" />
      <Column body={actionTemplate} />
    </DataTable>
  );
};
