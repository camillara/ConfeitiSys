import { Cliente } from "app/models/clientes";
import { Page } from "app/models/common/page";
import { ItemVenda, Venda } from "app/models/vendas";
import { useClienteService, useProdutoService } from "app/services";
import { useFormik } from "formik";
import {
  AutoComplete,
  AutoCompleteChangeParams,
  AutoCompleteCompleteMethodParams,
} from "primereact/autocomplete";
import { Button } from "primereact/button";
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Produto } from "app/models/produtos";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { validationScheme } from "./validationScheme";
import { InputDate } from "components";

const formatadorMoney = new Intl.NumberFormat("pt-br", {
  style: "currency",
  currency: "BRL",
});

interface VendasFormProps {
  onSubmit: (venda: Venda) => void;
  onNovaVenda: () => void;
  vendaRealizada: boolean;
}

const formScheme: Venda = {
  cliente: null!,
  itens: [] as ItemVenda[],
  total: 0,
  formaPagamento: "",
  statusPagamento: "",
  statusPedido: "",
  cadastro: "",
  dataEntrega: "",
  observacao: "",
};

export const VendasForm: React.FC<VendasFormProps> = ({
  onSubmit,
  onNovaVenda,
  vendaRealizada,
}) => {
  const formasPagamento: String[] = [
    "DINHEIRO",
    "PIX",
    "CARTAO_DE_CREDITO",
    "CARTAO_DE_DEBITO",
  ];
  const statusPagamento: String[] = ["PENDENTE", "PAGO"];
  const statusPedido: String[] = ["PRODUCAO", "ENTREGUE", "CANCELADO"];
  const clienteService = useClienteService();
  const produtoService = useProdutoService();
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([]);
  const [listaFiltradaProdutos, setListaFiltradaProdutos] = useState<Produto[]>(
    []
  );
  const [mensagem, setMensagem] = useState<string>("");
  const [codigoProduto, setCodigoProduto] = useState<string>("");
  const [quantidadeProduto, setQuantidadeProduto] = useState<number>(0);
  const [produto, setProduto] = useState<Produto>(null!);
  const [listaClientes, setListaClientes] = useState<Page<Cliente>>({
    content: [],
    first: 0,
    number: 0,
    size: 0,
    totalElements: 0,
  });

  const formik = useFormik<Venda>({
    onSubmit: (values) => {
      console.log("Form values:", values); // Imprime os valores originais do formulário
      const venda: Venda = {
        ...values,
        dataEntrega: values.dataEntrega
          ? new Date(values.dataEntrega).toISOString().split("T")[0]
          : "",
      };

      onSubmit(venda);
    },
    initialValues: formScheme,
    validationSchema: validationScheme,
  });
  

  const handleClienteAutocomplete = (e: AutoCompleteCompleteMethodParams) => {
    const nome = e.query;
    clienteService
      .find(nome, "", 0, 20)
      .then((clientes) => setListaClientes(clientes));
  };

  const handleClienteChange = (e: AutoCompleteChangeParams) => {
    const clienteSelecionado: Cliente = e.value;
    formik.setFieldValue("cliente", clienteSelecionado);
  };

  const handleCodigoProdutoSelect = (event: any) => {
    const parsedValue = parseInt(codigoProduto);

    if (!isNaN(parsedValue)) {
      produtoService
        .carregarProduto(parsedValue.toString())
        .then((produtoEncontrado) => setProduto(produtoEncontrado))
        .catch((error) => setMensagem("Produto não encontrado!"));
    }
  };

  const handleAddProduto = () => {
    const itensAdicionados = formik.values.itens || [];

    const jaExisteOItemNaVenda = itensAdicionados.some(
      (itemVenda: ItemVenda) => {
        return itemVenda.produto.id === produto.id;
      }
    );

    if (jaExisteOItemNaVenda) {
      itensAdicionados.forEach((itemVenda: ItemVenda) => {
        if (itemVenda.produto.id === produto.id) {
          itemVenda.quantidade = itemVenda.quantidade + quantidadeProduto;
        }
      });
    } else {
      itensAdicionados.push({
        produto: produto,
        quantidade: quantidadeProduto,
      });
    }

    setProduto(null!);
    setCodigoProduto("");
    setQuantidadeProduto(0);

    const total = totalVenda();
    formik.setFieldValue("total", total);
  };

  const handleFecharDialogProdutoNaoEncontrado = () => {
    setCodigoProduto("");
    setMensagem("");
    setProduto(null!);
  };

  const handleProdutoAutoComplete = async (
    event: AutoCompleteCompleteMethodParams
  ) => {
    if (!listaProdutos.length) {
      const produtosEncontrados = await produtoService.listar();
      setListaProdutos(produtosEncontrados);
    }
    const produtosEncontrados = listaProdutos.filter((produto: Produto) => {
      return produto.nome?.toUpperCase().includes(event.query.toUpperCase());
    });

    setListaFiltradaProdutos(produtosEncontrados);
  };

  const dialogMensagemFooter = () => {
    return (
      <div>
        <Button label="Ok" onClick={(e) => setMensagem("")} />
      </div>
    );
  };

  const disableAddProdutoButton = () => {
    return !produto || !quantidadeProduto;
  };

  const totalVenda = () => {
    const totais: number[] | undefined = formik.values.itens?.map(
      (itemVenda) => {
        if (itemVenda.produto && itemVenda.produto.preco) {
          return itemVenda.quantidade * itemVenda.produto.preco;
        }
        return 0;
      }
    );

    if (totais && totais.length) {
      return totais.reduce(
        (somatoriaAtual = 0, valorItemAtual) => somatoriaAtual + valorItemAtual
      );
    } else {
      return 0;
    }
  };

  const realizarNovaVenda = () => {
    formik.resetForm({
      values: formScheme, // Reseta com os valores iniciais do esquema
    });
    formik.setFieldValue("itens", []); // Garante que os itens também sejam resetados
    formik.setFieldTouched("itens", false); // Marca os campos como não tocados
    onNovaVenda(); // Chama a função que habilita a próxima venda
  };
  

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="p-fluid">
        <div className="p-grid p-align-center" style={{ gap: "1rem" }}>
          {/* Campo de Nome (Cliente) */}
          <div className="p-col-12 p-md-6">
            <div className="p-field">
              <label
                htmlFor="cliente"
                style={{ marginBottom: "0.5rem", fontWeight: "bold" }}
              >
                Cliente: *
              </label>
              <AutoComplete
                suggestions={listaClientes.content}
                completeMethod={handleClienteAutocomplete}
                value={formik.values.cliente}
                field="nome"
                id="cliente"
                name="cliente"
                onChange={handleClienteChange}
                style={{ height: "38px", width: "100%" }}
              />
              <small className="p-error p-d-block">
                {formik.errors.cliente}
              </small>
            </div>
          </div>

          {/* Campo de Data (Data Entrega) */}
          <div className="p-col-12 p-md-2">
            <div className="p-field">
              <InputDate
                id="dataEntrega"
                name="dataEntrega"
                autoComplete="on"
                onChange={formik.handleChange}
                value={formik.values.dataEntrega}
                error={formik.errors.dataEntrega}
                style={{ height: "38px", width: "100%" }}
                label={"Data Entrega: *"}
              />
            </div>
          </div>
        </div>

        <div className="p-grid p-align-center" style={{ gap: "1rem" }}>
          {/* Forma de Pagamento */}
          <div className="p-col-12 p-md-3">
            <div className="p-field">
              <label
                htmlFor="formaPagamento"
                style={{ marginBottom: "0.5rem", fontWeight: "bold" }}
              >
                Forma de Pagamento: *
              </label>
              <Dropdown
                id="formaPagamento"
                options={formasPagamento}
                value={formik.values.formaPagamento}
                onChange={(e) =>
                  formik.setFieldValue("formaPagamento", e.value)
                }
                placeholder="Selecione..."
                style={{
                  height: "38px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center", // Centraliza verticalmente
                  textAlign: "left", // Alinha o texto à esquerda
                }}
              />
              <small className="p-error p-d-block">
                {formik.touched.formaPagamento && formik.errors.formaPagamento}
              </small>
            </div>
          </div>

          {/* Status de Pagamento */}
          <div className="p-col-12 p-md-3">
            <div className="p-field">
              <label
                htmlFor="statusPagamento"
                style={{ marginBottom: "0.5rem", fontWeight: "bold" }}
              >
                Status de Pagamento: *
              </label>
              <Dropdown
                id="statusPagamento"
                options={statusPagamento}
                value={formik.values.statusPagamento}
                onChange={(e) =>
                  formik.setFieldValue("statusPagamento", e.value)
                }
                placeholder="Selecione..."
                style={{
                  height: "38px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "left",
                }}
              />
              <small className="p-error p-d-block">
                {formik.touched.statusPagamento &&
                  formik.errors.statusPagamento}
              </small>
            </div>
          </div>

          {/* Status do Pedido */}
          <div className="p-col-12 p-md-3">
            <div className="p-field">
              <label
                htmlFor="statusPedido"
                style={{ marginBottom: "0.5rem", fontWeight: "bold" }}
              >
                Status do Pedido: *
              </label>
              <Dropdown
                id="statusPedido"
                options={statusPedido}
                value={formik.values.statusPedido}
                onChange={(e) => formik.setFieldValue("statusPedido", e.value)}
                placeholder="Selecione..."
                style={{
                  height: "38px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center", // Centraliza verticalmente
                  textAlign: "left", // Alinha o texto à esquerda
                }}
              />
              <small className="p-error p-d-block">
                {formik.touched.statusPedido && formik.errors.statusPedido}
              </small>
            </div>
          </div>
        </div>

        {/* Seção de Adição de Produtos */}
        <div className="p-field">
          <label
            className="label"
            style={{ marginBottom: "1rem", fontSize: "1.2rem" }}
          >
            Adicione os itens do pedido:
          </label>
        </div>

        <div className="p-grid p-align-center" style={{ gap: "1rem" }}>
          <div className="p-col-12 p-md-2" style={{ display: "none" }}>
            <span className="p-float-label">
              <InputText
                id="codigoProduto"
                value={codigoProduto}
                disabled // Campo desabilitado
                style={{ height: "38px", width: "100%" }}
              />
              <label htmlFor="codigoProduto">Código</label>
            </span>
          </div>

          {/* AutoComplete de Produto */}
          <div className="p-col-12 p-md-6">
            <AutoComplete
              id="produto"
              name="produto"
              value={produto}
              field="nome"
              placeholder="Digite o nome do produto"
              suggestions={listaFiltradaProdutos}
              completeMethod={handleProdutoAutoComplete}
              onChange={(e) => {
                const selectedProduto = e.value;
                setProduto(selectedProduto);

                setCodigoProduto(selectedProduto ? selectedProduto.codigo : "");
              }}
              style={{ height: "38px", width: "100%" }}
            />
          </div>

          <div className="p-col-12 p-md-1">
            <span className="p-float-label">
              <InputText
                id="qtdProduto"
                value={quantidadeProduto}
                onChange={(e) => setQuantidadeProduto(Number(e.target.value))}
                style={{ height: "38px" }}
              />
              <label htmlFor="qtdProduto">QTD</label>
            </span>
          </div>

          <div
            className="p-col-12 p-md-2"
            style={{
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="button"
              label="+ Adicionar"
              onClick={handleAddProduto}
              disabled={disableAddProdutoButton()}
              className="button is-link"
              style={{
                width: "auto",
                minWidth: "150px",
                maxWidth: "100%",
                height: "38px",
                boxSizing: "border-box",
                cursor: "pointer",
                whiteSpace: "nowrap",
                padding: "0 10px",
                transition: "background-color 0.3s ease, font-size 0.3s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2196F3";
                e.currentTarget.style.fontSize = "1.2rem";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3273dc";
                e.currentTarget.style.fontSize = "1rem";
              }}
            />
          </div>
        </div>

        <br />

        {/* Seção da Tabela de Itens */}
        <div className="p-field">
          <label
            className="label"
            style={{ marginBottom: "1rem", fontSize: "1.2rem" }}
          >
            Itens do Pedido:
          </label>
        </div>

        <div className="p-col-12">
          <div className="p-col-12">
            <DataTable
              value={formik.values.itens}
              emptyMessage="Nenhum produto adicionado."
              responsiveLayout="scroll"
            >
              <Column field="produto.id" header="Código" />
              <Column field="produto.categoria" header="Categoria" />
              <Column field="produto.nome" header="Produto" />
              <Column field="produto.tipo" header="Tipo" />

              {/* Preço Unitário com formatação de moeda */}
              <Column
                field="produto.preco"
                header="Preço Unitário"
                body={(itemVenda: ItemVenda) => {
                  const precoFormatado = formatadorMoney.format(
                    itemVenda.produto.preco!
                  );
                  return <div>{precoFormatado}</div>;
                }}
              />

              <Column field="quantidade" header="QTD" />

              {/* Coluna Total */}
              <Column
                header="Total"
                body={(itemVenda: ItemVenda) => {
                  const total = itemVenda.produto.preco! * itemVenda.quantidade;
                  const totalFormatado = formatadorMoney.format(total);
                  return <div>{totalFormatado}</div>;
                }}
              />

              {/* Ações - Remover Item */}
              <Column
                header="Ações"
                body={(itemVenda: ItemVenda) => {
                  const handleRemoverItem = () => {
                    const novaLista = formik.values.itens?.filter(
                      (item) => item.produto.id !== itemVenda.produto.id
                    );
                    formik.setFieldValue("itens", novaLista);
                  };
                  return (
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="p-button-danger"
                      onClick={handleRemoverItem}
                    />
                  );
                }}
              />
            </DataTable>
          </div>

          <small className="p-error p-d-block">
            {formik.touched && formik.errors.itens}
          </small>
        </div>

        <div className="p-grid p-align-center" style={{ gap: "1rem" }}>
          {/* Campo Itens */}
          <div className="p-col-12 p-md-3">
            <div className="p-field">
              <label htmlFor="itens" style={{ marginBottom: "0.5rem" }}>
                Itens:
              </label>
              <InputText
                disabled
                value={formik.values.itens?.length}
                style={{ height: "38px", width: "100%" }}
              />
            </div>
          </div>

          {/* Campo Total */}
          <div className="p-col-12 p-md-3">
            <div className="p-field">
              <label htmlFor="total" style={{ marginBottom: "0.5rem" }}>
                Total:
              </label>
              <InputText
                disabled
                value={formatadorMoney.format(formik.values.total)}
                style={{ height: "38px", width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div className="columns">
          <div className="field is-full column">
            <label className="label" htmlFor="inputObservacao">
              Observação:
            </label>
            <div className="control">
              <textarea
                className="textarea"
                id="inputObservacao"
                name="observacao"
                value={formik.values.observacao}
                onChange={formik.handleChange}
                placeholder="Digite qualquer observação sobre a venda"
              />
            </div>
          </div>
        </div>

        {!vendaRealizada && <Button type="submit" label="Finalizar" />}
        {vendaRealizada && (
          <Button
            type="button"
            onClick={realizarNovaVenda}
            label="Nova Venda"
            className="p-button-success"
          />
        )}
      </div>
      <Dialog
        header="Atenção"
        position="top"
        visible={!!mensagem}
        onHide={handleFecharDialogProdutoNaoEncontrado}
        footer={dialogMensagemFooter}
      >
        {mensagem}
      </Dialog>
    </form>
  );
};
