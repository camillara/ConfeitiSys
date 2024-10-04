import React from "react";
import { useState, useEffect } from "react";
import { Layout, Input, InputMoney } from "components";
import { useProdutoService } from "app/services";
import { Produto, ItensProduto } from "app/models/produtos";
import { converterEmBigDecimal, formatReal } from "app/util/money";
import { Alert } from "components/common/message";
import { Dropdown } from "primereact/dropdown";
import * as yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AutoComplete,
  AutoCompleteChangeParams,
  AutoCompleteCompleteMethodParams,
} from "primereact/autocomplete";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";

const msgCampoObrigatorio = "Campo Obrigatório";

const validationSchema = yup.object().shape({
  categoria: yup.string().trim().required(msgCampoObrigatorio),
  tipo: yup.string().trim().required(msgCampoObrigatorio),
  nome: yup.string().trim().required(msgCampoObrigatorio),
  preco: yup
    .number()
    .required(msgCampoObrigatorio)
    .moreThan(0, "Valor deve ser maior que 0,00 Zero"),
  descricao: yup.string().trim(),
});

interface FormErrors {
  categoria?: string;
  tipo?: string;
  nome?: string;
  preco?: string;
  descricao?: string;
}

export const CadastroProdutos: React.FC = () => {
  const [id, setId] = useState<string>();
  const [cadastro, setCadastro] = useState<string>();
  const service = useProdutoService();
  const [categoria, setCategoria] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [preco, setPreco] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [itensProduto, setItensProduto] = useState<ItensProduto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([]);
  const [listaFiltradaProdutos, setListaFiltradaProdutos] = useState<Produto[]>([]);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [messages, setMessages] = useState<Array<Alert>>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const { id: queryId } = router.query;

  // Carregar todos os produtos uma vez
  useEffect(() => {
    service.listar().then((produtosEncontrados) => {
      setListaProdutos(produtosEncontrados);
    });
  }, []);

  // Carregar o produto específico pelo ID (e os seus itens) quando o ID for fornecido
  useEffect(() => {
    if (queryId) {
      service.carregarProduto(queryId).then((produtoEncontrado: Produto) => {
        setId(produtoEncontrado.id);
        setCategoria(produtoEncontrado.categoria ?? "");
        setTipo(produtoEncontrado.tipo ?? "");
        setNome(produtoEncontrado.nome ?? "");
        setDescricao(produtoEncontrado.descricao ?? "");
        setPreco(formatReal(`${produtoEncontrado.preco}`));
        setCadastro(produtoEncontrado.cadastro || ``);
        setItensProduto(produtoEncontrado.itensProduto || []);
      });
    }
  }, [queryId]);

  const submit = () => {
    const produto: Produto = {
      id,
      categoria,
      tipo,
      preco: converterEmBigDecimal(preco),
      nome,
      descricao,
      itensProduto: itensProduto.length > 0 ? itensProduto : [], // Enviar a lista sempre
    };

    validationSchema
      .validate(produto)
      .then(() => {
        setErrors({});
        if (id) {
          service.atualizar(produto).then(() => {
            setMessages([
              {
                tipo: "success",
                texto: "Produto atualizado com sucesso!",
              },
            ]);
          });
        } else {
          service.salvar(produto).then((produtoResposta) => {
            setId(produtoResposta.id);
            setCadastro(produtoResposta.cadastro);
            setMessages([
              {
                tipo: "success",
                texto: "Produto salvo com sucesso!",
              },
            ]);
          });
        }
      })
      .catch((error) => {
        const field = error.path;
        const message = error.message;

        setErrors({
          ...errors,
          [field]: message,
        });
      });
  };

  const adicionarItemProduto = () => {
    if (produtoSelecionado) {
      const indexExistente = itensProduto.findIndex(
        (item) => item.itemProdutoId === produtoSelecionado.id
      );

      if (indexExistente >= 0) {
        const itensAtualizados = [...itensProduto];
        itensAtualizados[indexExistente].quantidade = quantidade;
        setItensProduto(itensAtualizados);
      } else {
        const itemProduto: ItensProduto = {
          produtoId: Number(id),
          itemProdutoId: Number(produtoSelecionado.id),
          quantidade: quantidade,
        };
        setItensProduto([...itensProduto, itemProduto]);
      }

      setProdutoSelecionado(null);
      setQuantidade(1);
    }
  };

  const handleProdutoAutoComplete = async (
    event: AutoCompleteCompleteMethodParams
  ) => {
    if (!listaProdutos.length) {
      const produtosEncontrados = await service.listar();
      setListaProdutos(produtosEncontrados);
    }

    const produtosFiltrados = listaProdutos.filter(
      (produto) =>
        produto.categoria === "MATERIA_PRIMA" &&
        produto.nome &&
        produto.nome.toUpperCase().includes(event.query.toUpperCase())
    );
    setListaFiltradaProdutos(produtosFiltrados);
  };

  const handleProdutoChange = (e: AutoCompleteChangeParams) => {
    setProdutoSelecionado(e.value);
  };

  const calcularValorTotal = (quantidade: number, valorUnitario: number = 0) => {
    return quantidade * (valorUnitario !== undefined ? valorUnitario : 0);
  };

  const calcularSomatorioTotal = () => {
    return itensProduto.reduce((total, item) => {
      const produto = listaProdutos.find((p) => p.id === item.itemProdutoId);
      const valorUnitario = produto ? produto.preco || 0 : 0;
      return total + calcularValorTotal(item.quantidade, valorUnitario);
    }, 0);
  };

  const removerItemProduto = (itemProdutoId: number) => {
    const novaLista = itensProduto.filter((item) => item.itemProdutoId !== itemProdutoId);
    setItensProduto(novaLista);
  };

  const categorias = [
    "MATERIA_PRIMA",
    "BOLO",
    "DOCE",
    "QUITANDA",
    "TORTA",
    "SOBREMESA",
    "BEBIDA",
    "CUPCAKE_MUFFIN",
    "SALGADO",
    "RECHEIO_COBERTURA",
    "UTENSILIO_EMBALAGEM",
  ];

  const tipos = [
    "UN", // Unidade
    "GR", // Gramas
    "ML", // Mililitros
    "KG", // Quilogramas
    "L", // Litros
    "CX", // Caixa
    "PC", // Pacote
    "FT", // Fatia
    "DZ", // Dúzia
    "TBSP", // Colher de sopa
    "TSP", // Colher de chá
  ];

  return (
    <Layout titulo="CADASTRO DE PRODUTO" mensagens={messages}>
      <div className="columns">
        <Input
          label="Código:"
          columnClasses="is-3"
          value={id || ""}
          id="inputId"
          disabled={true}
        />

        <Input
          label="Data do Cadastro:"
          columnClasses="is-3"
          value={cadastro || ""}
          id="inputDataCadastro"
          disabled={true}
        />

        <div className="field column is-3">
          <label className="label" htmlFor="inputCategoria">
            Categoria: *
          </label>
          <div className="control">
            <Dropdown
              id="inputCategoria"
              options={categorias}
              value={categoria}
              onChange={(e) => setCategoria(e.value)}
              placeholder="Selecione a categoria"
              style={{
                width: "100%",
                height: "38px",
                boxSizing: "border-box",
              }}
            />
            {errors.categoria && (
              <p className="help is-danger">{errors.categoria}</p>
            )}
          </div>
        </div>

        <div className="field column is-3">
          <label className="label" htmlFor="inputTipo">
            Tipo: *
          </label>
          <div className="control">
            <Dropdown
              id="inputTipo"
              options={tipos}
              value={tipo}
              onChange={(e) => setTipo(e.value)}
              placeholder="Selecione o tipo"
              style={{
                width: "100%",
                height: "38px",
                boxSizing: "border-box",
              }}
            />
            {errors.tipo && (
              <p className="help is-danger">{errors.tipo}</p>
            )}
          </div>
        </div>
      </div>

      <div className="columns">
        <Input
          label="Nome: *"
          columnClasses="is-7"
          onChange={(e) => setNome(e.target.value)}
          value={nome}
          id="inputNome"
          placeholder="Digite o Nome do produto"
          error={errors.nome}
        />

        <InputMoney
          label="Preço: *"
          columnClasses="is-3"
          onChange={(e) => setPreco(e.target.value)}
          value={preco}
          id="inputPreco"
          placeholder="Digite o Preço do produto"
          maxLength={16}
          error={errors.preco}
        />
      </div>

      <div className="columns">
        <div className="field is-full column">
          <label className="label" htmlFor="inputDescricao">
            Descrição
          </label>
          <div className="control">
            <textarea
              className="textarea"
              id="inputDescricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Digite a Descrição detalhada do produto"
              style={{
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {categoria !== "MATERIA_PRIMA" && (
        <>
          <div className="columns">
            <div className="field column is-4">
              <label className="label" htmlFor="produtoAutocomplete">
                Insumos / Matéria Prima
              </label>
              <div className="control" style={{ width: "100%" }}>
                <AutoComplete
                  id="produtoAutocomplete"
                  suggestions={listaFiltradaProdutos}
                  completeMethod={handleProdutoAutoComplete}
                  value={produtoSelecionado}
                  field="nome"
                  onChange={handleProdutoChange}
                  placeholder="Digite o nome do produto"
                  style={{
                    width: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div className="field column is-4">
              <label className="label" htmlFor="inputQuantidade">
                Qtd
              </label>
              <div className="control" style={{ width: "10%" }}>
                <InputNumber
                  id="inputQuantidade"
                  value={quantidade}
                  onValueChange={(e) => setQuantidade(e.value || 1)}
                  min={1}
                  placeholder="Quantidade"
                  style={{
                    width: "100%",
                    height: "38px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div className="field column is-2">
              <div className="control" style={{ marginTop: "30px" }}>
                <Button
                  type="button"
                  className="button is-link"
                  onClick={adicionarItemProduto}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          <div className="field">
            <h3>Insumos Utilizados na Produção</h3>
            <DataTable value={itensProduto} emptyMessage="Nenhum item adicionado.">
              <Column
                field="itemProdutoId"
                header="Produto"
                body={(rowData: ItensProduto) => {
                  const item = listaProdutos.find((p) => p.id === rowData.itemProdutoId);
                  return item ? item.nome : "N/A";
                }}
              />
              <Column field="quantidade" header="Qtd" />
              <Column
                header="Tipo"
                body={(rowData: ItensProduto) => {
                  const item = listaProdutos.find((p) => p.id === rowData.itemProdutoId);
                  return item ? item.tipo : "N/A";
                }}
              />
              <Column
                header="Vl. Unit"
                body={(rowData: ItensProduto) => {
                  const item = listaProdutos.find((p) => p.id === rowData.itemProdutoId);
                  return item ? formatReal(item.preco || 0) : "0,00";
                }}
              />
              <Column
                header="Vl. Total"
                body={(rowData: ItensProduto) => {
                  const item = listaProdutos.find((p) => p.id === rowData.itemProdutoId);
                  return item ? formatReal(calcularValorTotal(rowData.quantidade, item.preco || 0)) : "0,00";
                }}
              />
              <Column
                header="Ações"
                body={(rowData: ItensProduto) => (
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={() => removerItemProduto(rowData.itemProdutoId!)}
                  />
                )}
              />
            </DataTable>
            <div className="columns is-justify-content-flex-end mt-2">
              <strong>Total Geral: {formatReal(calcularSomatorioTotal())}</strong>
            </div>
          </div>
        </>
      )}

      <div className="field is-grouped">
        <div className="control">
          <button className="button is-link" onClick={submit}>
            {id ? "Atualizar" : "Salvar"}
          </button>
        </div>
        <div className="control">
          <Link href="/consultas/produtos">
            <button className="button is-link is-light">Voltar</button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
