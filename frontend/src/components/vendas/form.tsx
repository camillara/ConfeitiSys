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
      //console.log("Form values:", values); // Adiciona o console.log aqui
      const venda: Venda = {
        ...values,
        dataEntrega: values.dataEntrega ? new Date(values.dataEntrega).toISOString().split("T")[0] : "",
      };
      //console.log("Venda enviada:", venda);
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
    onNovaVenda();
    formik.resetForm();
    formik.setFieldValue("itens", []);
    formik.setFieldTouched("itens", false);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="p-fluid">
        <div className="p-field">
          <label htmlFor="cliente">Cliente: *</label>
          <AutoComplete
            suggestions={listaClientes.content}
            completeMethod={handleClienteAutocomplete}
            value={formik.values.cliente}
            field="nome"
            id="cliente"
            name="cliente"
            onChange={handleClienteChange}
          />
          <small className="p-error p-d-block">{formik.errors.cliente}</small>
        </div>

        <div className="p-grid">
          <div className="p-col-2">
            <span className="p-float-label">
              <InputText
                id="codigoProduto"
                onBlur={handleCodigoProdutoSelect}
                value={codigoProduto}
                onChange={(e) => setCodigoProduto(e.target.value)}
              />
              <label htmlFor="codigoProduto">Código</label>
            </span>
          </div>

          <div className="p-col-6">
            <AutoComplete
              id="produto"
              name="produto"
              value={produto}
              field="nome"
              suggestions={listaFiltradaProdutos}
              completeMethod={handleProdutoAutoComplete}
              onChange={(e) => setProduto(e.value)}
            />
          </div>

          <div className="p-col-2">
            <span className="p-float-label">
              <InputText
                id="qtdProduto"
                value={quantidadeProduto}
                onChange={(e) => setQuantidadeProduto(Number(e.target.value))}
              />
              <label htmlFor="qtdProduto">QTD</label>
            </span>
          </div>

          <div className="p-col-2">
            <Button
              type="button"
              label="Adicionar"
              onClick={handleAddProduto}
              disabled={disableAddProdutoButton()}
            />
          </div>
          <div className="p-col-12">
            <DataTable
              value={formik.values.itens}
              emptyMessage="Nenhum produto adicionado."
            >
              <Column
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
                      label="Excluir"
                      onClick={handleRemoverItem}
                    />
                  );
                }}
              />
              <Column field="produto.id" header="Código" />
              <Column field="produto.categoria" header="Categoria" />
              <Column field="produto.nome" header="Produto" />
              <Column field="produto.preco" header="Preço Unitário" />
              <Column field="quantidade" header="QTD" />
              <Column
                header="Total"
                body={(itemVenda: ItemVenda) => {
                  const total = itemVenda.produto.preco! * itemVenda.quantidade;
                  const totalFormatado = formatadorMoney.format(total);
                  return <div>{totalFormatado}</div>;
                }}
              />
            </DataTable>
            <small className="p-error p-d-block">
              {formik.touched && formik.errors.itens}
            </small>
          </div>
          <div className="p-col-5">
            <div className="p-field">
              <label htmlFor="formaPagamento">Forma de Pagamento: *</label>
              <Dropdown
                id="formaPagamento"
                options={formasPagamento}
                value={formik.values.formaPagamento}
                onChange={(e) =>
                  formik.setFieldValue("formaPagamento", e.value)
                }
                placeholder="Selecione..."
              />
              <small className="p-error p-d-block">
                {formik.touched && formik.errors.formaPagamento}
              </small>
            </div>
          </div>
          <div className="p-col-5">
            <div className="p-field">
              <label htmlFor="statusPagamento">Status de Pagamento: *</label>
              <Dropdown
                id="statusPagamento"
                options={statusPagamento}
                value={formik.values.statusPagamento}
                onChange={(e) =>
                  formik.setFieldValue("statusPagamento", e.value)
                }
                placeholder="Selecione..."
              />
              <small className="p-error p-d-block">
                {formik.touched && formik.errors.statusPagamento}
              </small>
            </div>
          </div>

          <div className="p-col-5">
            <div className="p-field">
              <label htmlFor="statusPedido">Status do Pedido: *</label>
              <Dropdown
                id="statusPedido"
                options={statusPedido}
                value={formik.values.statusPedido}
                onChange={(e) => formik.setFieldValue("statusPedido", e.value)}
                placeholder="Selecione..."
              />
              <small className="p-error p-d-block">
                {formik.touched && formik.errors.statusPedido}
              </small>
            </div>
          </div>

          <InputDate
          id="dataEntrega"
          name="dataEntrega"
          label="Data Entrega: *"
          autoComplete="off"
          columnClasses="is-half"
          onChange={formik.handleChange}
          value={formik.values.dataEntrega}
          error={formik.errors.dataEntrega}
        />

          <div className="p-col-2">
            <div className="p-field">
              <label htmlFor="itens">Itens:</label>
              <InputText disabled value={formik.values.itens?.length} />
            </div>
          </div>

          <div className="p-col-2">
            <div className="p-field">
              <label htmlFor="total">Total:</label>
              <InputText
                disabled
                value={formatadorMoney.format(formik.values.total)}
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
