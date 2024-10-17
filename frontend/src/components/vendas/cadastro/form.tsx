import { Cliente } from "app/models/clientes";
import { Page } from "app/models/common/page";
import { ItemVenda, Venda, ItemProdutoAtualizarDTO } from "app/models/vendas";
import {
  useClienteService,
  useProdutoService,
  useVendaService,
} from "app/services";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import {
  AutoComplete,
  AutoCompleteChangeParams,
  AutoCompleteCompleteMethodParams,
} from "primereact/autocomplete";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Produto } from "app/models/produtos";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { validationScheme } from "./validationScheme";
import { useRouter } from "next/router";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";

const formatadorMoney = new Intl.NumberFormat("pt-br", {
  style: "currency",
  currency: "BRL",
});

interface VendasFormProps {
  onSubmit: (venda: Venda) => void;
  onNovaVenda: () => void;
  vendaRealizada: boolean;
  venda?: Venda;
}

const formScheme: Venda = {
  cliente: null!,
  itens: [] as ItemVenda[],
  total: 0,
  valorRecebido: 0, // Novo campo
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
  venda,
}) => {
  const router = useRouter(); // Usando o useRouter para pegar a URL atual
  const { id } = router.query; // Pegando o parâmetro "id" da URL
  console.log("ID da venda vindo do router:", id);
  const { buscarPorId, listarItensPorVenda } = useVendaService(); // Função para buscar a venda e os itens pelo ID

  const formasPagamento: String[] = [
    "DINHEIRO",
    "PIX",
    "CARTAO_DE_CREDITO",
    "CARTAO_DE_DEBITO",
  ];
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
      const venda: Venda = {
        ...values,
        statusPagamento:
          values.valorRecebido === values.total ? "PAGO" : "PENDENTE",
        id: id ? Number(id) : undefined, // Inclui o ID se estiver editando uma venda
        cliente: { id: values.cliente?.id } as Cliente, // Enviando apenas o id do cliente
        dataEntrega:
          values.dataEntrega && !isNaN(new Date(values.dataEntrega).getTime())
            ? new Date(values.dataEntrega).toISOString().split("T")[0]
            : "",
      };

      // Verifica se estamos atualizando ou criando uma nova venda
      if (id) {
        onSubmit({ ...venda, id: Number(id) });
      } else {
        onSubmit(venda);
      }
    },
    initialValues: formScheme,
    validationSchema: validationScheme,
  });

  const { carregarProduto } = useProdutoService();

  // Função para carregar os produtos e montar a lista de itens
  const carregarItensVenda = async (
    itensVenda: ItemVenda[],
    idVenda: number | undefined // Ajustando o tipo para aceitar undefined
  ) => {
    console.log("Verificando idVenda:", idVenda); // Adicione esta linha para verificar o valor de idVenda

    if (!idVenda) {
      // Se não houver idVenda, isso significa que é uma nova venda
      console.log("Nova venda, não é necessário carregar itens.");
      formik.setFieldValue("itens", []); // Limpa os itens no formik
      return; // Retorna sem fazer a chamada à API
    }

    try {
      const itensProduto = await listarItensPorVenda(idVenda); // Buscar os itens com o preço gravado no momento da venda
      const itensComProduto = await Promise.all(
        itensVenda.map(async (item) => {
          const itemAtualizado = itensProduto.find(
            (i) => i.produtoId === item.idProduto
          ); // Buscar o item correspondente pelo produtoId

          if (!item.idProduto || !itemAtualizado) {
            console.error("Produto não encontrado para o item", item);
            return item; // Retorne o item sem alterar se o idProduto ou itemAtualizado não existir
          }

          // Carregar o produto pelo ID
          try {
            const produto = await carregarProduto(item.idProduto); // Usando idProduto diretamente
            return {
              ...item,
              produto,
              precoUnitario: itemAtualizado.precoUnitario, // Usar o preço gravado na venda
            };
          } catch (error) {
            console.error(
              "Erro ao carregar o produto com idProduto:",
              item.idProduto,
              error
            );
            return item; // Retorne o item sem modificar se houver erro ao carregar o produto
          }
        })
      );

      formik.setFieldValue("itens", itensComProduto); // Atualizar a lista de itens no formik
    } catch (error) {
      console.error("Erro ao carregar os itens da venda:", error);
    }
  };

  useEffect(() => {
    // Verificar se o ID da venda existe
    console.log("ID da venda vindo do router:", id);

    if (!id) {
      // Se não houver ID, estamos criando uma nova venda
      console.log("Nova venda, não é necessário carregar itens.");
      formik.resetForm({ values: formScheme }); // Resetar o formulário para valores iniciais
      formik.setFieldValue("itens", []); // Certificar-se de que os itens estão vazios
      return; // Sair da função
    }

    // Caso haja um ID, estamos editando uma venda, então buscamos os dados
    buscarPorId(Number(id))
      .then((vendaCarregada) => {
        if (vendaCarregada) {
          console.log("Venda carregada:", vendaCarregada);

          // Formatar a data de entrega recebida (que está no formato "dd/MM/yyyy") para um objeto Date sem ajuste de fuso horário
          const [dia, mes, ano] = vendaCarregada.dataEntrega
            .split("/")
            .map(Number);
          const dataEntregaFormatada = vendaCarregada.dataEntrega
            ? new Date(ano, mes - 1, dia) // Mês no JavaScript é baseado em zero, por isso (mes - 1)
            : null;

          // Definir os valores do formik com a venda carregada e a data formatada
          formik.setValues({
            ...vendaCarregada,
            dataEntrega: dataEntregaFormatada, // Atribuir o objeto Date ao formik
          });

          carregarItensVenda(vendaCarregada.itens || [], Number(id)); // Carregar os itens da venda
        } else {
          formik.resetForm({ values: formScheme }); // Se a venda não for encontrada, resetar o formulário
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar a venda:", error);
      });
  }, [id]);

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
        .catch(() => setMensagem("Produto não encontrado!"));
    }
  };

  const handleAddProduto = () => {
    console.log("Produto selecionado:", produto); // Verifica se o produto está correto
    console.log("Preço do produto selecionado:", produto.preco); // Verifica o preço do produto

    const itensAdicionados = formik.values.itens || [];

    const jaExisteOItemNaVenda = itensAdicionados.some(
      (itemVenda: ItemVenda) => itemVenda.produto.id === produto.id
    );

    if (jaExisteOItemNaVenda) {
      itensAdicionados.forEach((itemVenda: ItemVenda) => {
        if (itemVenda.produto.id === produto.id) {
          itemVenda.quantidade += quantidadeProduto;
          console.log(
            "Item já existe na venda. Quantidade atualizada para:",
            itemVenda.quantidade
          );
        }
      });
    } else {
      itensAdicionados.push({
        produto, // Produto é o objeto selecionado
        quantidade: quantidadeProduto,
        precoUnitario: produto.preco, // Atribui o preço do produto no momento da adição
      });
      console.log(
        "Novo item adicionado à venda:",
        produto.nome,
        "com preço:",
        produto.preco
      );
    }

    setProduto(null!);
    setCodigoProduto("");
    setQuantidadeProduto(0);

    // Calcula o total da venda e atualiza o campo
    const total = totalVenda();
    console.log("Total atualizado:", total); // Verifica se o total está sendo calculado corretamente
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
    const produtosEncontrados = listaProdutos.filter((produto: Produto) =>
      produto.nome?.toUpperCase().includes(event.query.toUpperCase())
    );
    setListaFiltradaProdutos(produtosEncontrados);
  };

  const dialogMensagemFooter = () => {
    return (
      <div>
        <Button label="Ok" onClick={() => setMensagem("")} />
      </div>
    );
  };

  const disableAddProdutoButton = () => {
    return !produto || !quantidadeProduto;
  };

  const totalVenda = () => {
    console.log("Itens na venda:", formik.values.itens); // Verifica os itens atualmente na venda

    const totais: number[] | undefined = formik.values.itens?.map(
      (itemVenda) => {
        // Verifica se o itemVenda possui um precoUnitario ou usa o preco do produto
        const precoUnitario =
          itemVenda.precoUnitario || itemVenda.produto?.preco || 0;
        console.log(
          "Preço unitário para o item:",
          itemVenda.produto?.nome,
          precoUnitario
        ); // Verifica o preço unitário de cada item
        return itemVenda.quantidade * precoUnitario;
      }
    );

    if (totais && totais.length) {
      const total = totais.reduce(
        (somatoriaAtual = 0, valorItemAtual) => somatoriaAtual + valorItemAtual
      );
      console.log("Total calculado da venda:", total); // Verifica o total calculado
      return total;
    } else {
      return 0;
    }
  };

  const realizarNovaVenda = () => {
    formik.resetForm({
      values: formScheme,
    });
    formik.setFieldValue("itens", []);
    formik.setFieldTouched("itens", false);
    onNovaVenda();
  };

  const handleSubmit = async (venda: Venda) => {
    try {
      if (venda.id) {
        // Atualizar venda existente
        await service.atualizarVenda(venda.id, venda);
      } else {
        // Criar nova venda
        await service.realizarVenda(venda);
      }

      // Redireciona ou exibe uma mensagem de sucesso após salvar
      Router.push("/vendas");
    } catch (error) {
      console.error("Erro ao salvar a venda:", error);
    }
  };

  useEffect(() => {
    if (venda) {
      formik.setValues({
        ...venda,
        valorRecebido: venda.valorRecebido || 0,
        total: venda.total || 0,
      });
    }
  }, [venda]);

  const handleValorRecebidoChange = (e) => {
    const valorRecebido = e.value;

    if (valorRecebido > formik.values.total) {
      formik.setFieldValue("valorRecebido", formik.values.total);
    } else {
      formik.setFieldValue("valorRecebido", valorRecebido);
    }

    // Atualiza automaticamente o statusPagamento
    const novoStatus =
      valorRecebido === formik.values.total ? "PAGO" : "PENDENTE";
    formik.setFieldValue("statusPagamento", novoStatus);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="p-fluid">
        <div className="p-fluid">
          <div className="columns" style={{ gap: "1rem" }}>
            {/* Campo de Nome (Cliente) */}
            <div className="column is-7">
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
            <div className="column is-2">
              <div className="p-field">
                <label
                  htmlFor="dataEntrega"
                  style={{ marginBottom: "0.5rem", fontWeight: "bold" }}
                >
                  Data Entrega: *
                </label>
                <Calendar
                  id="dataEntrega"
                  name="dataEntrega"
                  value={formik.values.dataEntrega}
                  onChange={(e) => formik.setFieldValue("dataEntrega", e.value)}
                  dateFormat="dd/mm/yy"
                  placeholder="dd/mm/aaaa"
                  showIcon
                  style={{ height: "38px", width: "100%" }}
                />
                <small className="p-error p-d-block">
                  {formik.errors.dataEntrega}
                </small>
              </div>
            </div>
          </div>

          <div className="columns" style={{ gap: "1rem" }}>
            {/* Forma de Pagamento */}
            <div className="column is-3">
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
                  style={{ height: "38px", width: "100%" }}
                />
                <small className="p-error p-d-block">
                  {formik.touched.formaPagamento &&
                    formik.errors.formaPagamento}
                </small>
              </div>
            </div>

            {/* Status de Pagamento */}
            <div className="column is-3">
              <div className="p-field">
                <label
                  htmlFor="statusPagamento"
                  style={{ marginBottom: "0.5rem", fontWeight: "bold" }}
                >
                  Status de Pagamento: *
                </label>
                <div className="column is-3">
                  <Dropdown
                    disabled
                    options={["PAGO", "PENDENTE"]}
                    value={formik.values.statusPagamento}
                    placeholder="Status de Pagamento"
                  />
                </div>
                <small className="p-error p-d-block">
                  {formik.touched.statusPagamento &&
                    formik.errors.statusPagamento}
                </small>
              </div>
            </div>

            {/* Status do Pedido */}
            <div className="column is-3">
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
                  onChange={(e) =>
                    formik.setFieldValue("statusPedido", e.value)
                  }
                  placeholder="Selecione..."
                  style={{ height: "38px", width: "100%" }}
                />
                <small className="p-error p-d-block">
                  {formik.touched.statusPedido && formik.errors.statusPedido}
                </small>
              </div>
            </div>
          </div>
          <br />

          {/* Seção de Adição de Produtos */}
          <div className="p-field">
            <label
              className="label"
              style={{ marginBottom: "1rem", fontSize: "1.2rem" }}
            >
              Adicione os itens do pedido:
            </label>
          </div>

          <div className="columns" style={{ gap: "1rem" }}>
            <div className="column is-3" style={{ display: "none" }}>
              <span className="p-float-label">
                <InputText
                  id="codigoProduto"
                  value={codigoProduto}
                  disabled
                  style={{ height: "38px", width: "100%" }}
                />
                <label htmlFor="codigoProduto">Código</label>
              </span>
            </div>

            {/* AutoComplete de Produto */}
            <div className="column is-7">
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
                  setCodigoProduto(
                    selectedProduto ? selectedProduto.codigo : ""
                  );
                }}
                style={{ height: "38px", width: "100%" }}
              />
            </div>

            <div className="column is-1">
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
              className="column is-2"
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
              <Column
                header="Preço Unitário"
                body={(itemVenda: ItemVenda) => {
                  const precoUnitario =
                    itemVenda.precoUnitario || itemVenda.produto?.preco || 0;
                  const precoFormatado = formatadorMoney.format(precoUnitario);
                  return <div>{precoFormatado}</div>;
                }}
              />
              <Column field="quantidade" header="QTD" />
              <Column
                header="Total"
                body={(itemVenda: ItemVenda) => {
                  const precoUnitario =
                    itemVenda.precoUnitario || itemVenda.produto?.preco || 0;
                  const total = precoUnitario * itemVenda.quantidade;
                  const totalFormatado = formatadorMoney.format(total);
                  return <div>{totalFormatado}</div>;
                }}
              />
              <Column
                header="Ações"
                body={(itemVenda: ItemVenda) => {
                  const handleRemoverItem = () => {
                    const novaLista = formik.values.itens.filter(
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
        <br />

        <div className="columns" style={{ gap: "1rem" }}>
          {/* Campo Itens */}
          <div className="column is-3">
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
          <div className="column is-3">
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

          <div className="column is-3">
            <label>Valor Recebido:</label>
            <InputNumber
              value={formik.values.valorRecebido}
              onValueChange={handleValorRecebidoChange}
              mode="currency"
              currency="BRL"
              locale="pt-BR"
              max={formik.values.total}
            />
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

        <div className="columns">
          <div className="field is-full column" style={{ textAlign: "right" }}>
            {/* Botão de Atualizar para Edição */}
            {!vendaRealizada && id ? (
              <Button
                type="submit"
                label="Atualizar"
                className="p-button-primary"
                style={{
                  backgroundColor: "#007bff",
                  borderColor: "#007bff",
                  color: "#ffffff",
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
                  e.currentTarget.style.backgroundColor = "#0056b3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#007bff";
                }}
              />
            ) : (
              // Botão de Finalizar para nova venda
              !vendaRealizada && (
                <Button
                  type="submit"
                  label="Salvar"
                  className="p-button-primary"
                  style={{
                    backgroundColor: "#007bff",
                    borderColor: "#007bff",
                    color: "#ffffff",
                    width: "auto",
                    minWidth: "150px",
                    maxWidth: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    padding: "0 10px",
                    transition:
                      "background-color 0.3s ease, font-size 0.3s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#0056b3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#007bff";
                  }}
                />
              )
            )}

            {/* Botão de Voltar para a listagem */}
            <Button
              type="button"
              onClick={() => router.push("/consultas/vendas")}
              label="Voltar"
              className="p-button-secondary"
              style={{
                marginLeft: "10px",
                backgroundColor: "#d4e5ff",
                borderColor: "#b3d1ff",
                color: "#007bff",
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
                e.currentTarget.style.backgroundColor = "#cce0ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#d4e5ff";
              }}
            />
          </div>
        </div>
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
