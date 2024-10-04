import React from "react";
import { useState, useEffect } from "react";
import { Layout, Input, InputMoney } from "components";
import { useProdutoService } from "app/services";
import { Produto, ItensProduto } from "app/models/produtos";
import { converterEmBigDecimal, formatReal } from "app/util/money";
import { Alert } from "components/common/message";
import * as yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import styles from "./style.module.css"; // Importando o CSS Module
import Select from "react-select";

const msgCampoObrigatorio = "Campo Obrigatório";

const validationSchema = yup.object().shape({
  categoria: yup.object().required(msgCampoObrigatorio),
  tipo: yup.object().required(msgCampoObrigatorio),
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
  const [categoria, setCategoria] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [tipo, setTipo] = useState<{ value: string; label: string } | null>(
    null
  );
  const [preco, setPreco] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [itensProduto, setItensProduto] = useState<ItensProduto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([]);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [messages, setMessages] = useState<Array<Alert>>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const { id: queryId } = router.query;

  // Definição das constantes categorias e tipos
  const categorias = [
    { value: "MATERIA_PRIMA", label: "Matéria Prima" },
    { value: "BOLO", label: "Bolo" },
    { value: "DOCE", label: "Doce" },
    { value: "QUITANDA", label: "Quitanda" },
    { value: "TORTA", label: "Torta" },
    { value: "SOBREMESA", label: "Sobremesa" },
    { value: "BEBIDA", label: "Bebida" },
    { value: "CUPCAKE_MUFFIN", label: "Cupcake/Muffin" },
    { value: "SALGADO", label: "Salgado" },
    { value: "RECHEIO_COBERTURA", label: "Recheio/Cobertura" },
    { value: "UTENSILIO_EMBALAGEM", label: "Utensílio/Embalagem" },
  ];

  const tipos = [
    { value: "UN", label: "Unidade" },
    { value: "GR", label: "Gramas" },
    { value: "ML", label: "Mililitros" },
    { value: "KG", label: "Quilogramas" },
    { value: "L", label: "Litros" },
    { value: "CX", label: "Caixa" },
    { value: "PC", label: "Pacote" },
    { value: "FT", label: "Fatia" },
    { value: "DZ", label: "Dúzia" },
    { value: "TBSP", label: "Colher de sopa" },
    { value: "TSP", label: "Colher de chá" },
  ];

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
        setCategoria(
          categorias.find((cat) => cat.value === produtoEncontrado.categoria) ||
            null
        );
        setTipo(
          tipos.find((tipo) => tipo.value === produtoEncontrado.tipo) || null
        );
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
      categoria: categoria?.value || "",
      tipo: tipo?.value || "",
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
        (item) => item.itemProdutoId === produtoSelecionado.value
      );

      if (indexExistente >= 0) {
        // Atualizar a quantidade do item já existente
        const itensAtualizados = [...itensProduto];
        itensAtualizados[indexExistente].quantidade = quantidade;
        setItensProduto(itensAtualizados);
      } else {
        // Adicionar um novo item
        const itemProduto: ItensProduto = {
          produtoId: Number(id),
          itemProdutoId: produtoSelecionado.value,
          quantidade: quantidade,
        };
        setItensProduto([...itensProduto, itemProduto]);
      }

      // Limpar a seleção e resetar quantidade
      setProdutoSelecionado(null);
      setQuantidade(1);
    }
  };

  const calcularValorTotal = (
    quantidade: number,
    valorUnitario: number = 0
  ) => {
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
    const novaLista = itensProduto.filter(
      (item) => item.itemProdutoId !== itemProdutoId
    );
    setItensProduto(novaLista);
  };

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
            <Select
              id="inputCategoria"
              options={categorias}
              value={categoria}
              onChange={(selectedOption) => setCategoria(selectedOption)}
              placeholder="Selecione a categoria"
              styles={{
                container: (provided) => ({
                  ...provided,
                  width: "100%",
                }),
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
            <Select
              id="inputTipo"
              options={tipos}
              value={tipo}
              onChange={(selectedOption) => setTipo(selectedOption)}
              placeholder="Selecione o tipo"
              styles={{
                container: (provided) => ({
                  ...provided,
                  width: "100%",
                }),
              }}
            />
            {errors.tipo && <p className="help is-danger">{errors.tipo}</p>}
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
              className="textarea descricao-textarea"
              id="inputDescricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Digite a Descrição detalhada do produto"
            />
          </div>
        </div>
      </div>

      {categoria?.value !== "MATERIA_PRIMA" && (
        <>
          <div
            className="columns is-flex"
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <div className="field column" style={{ flexGrow: 1 }}>
              <label className="label" htmlFor="produtoSelect">
                Insumos / Matéria Prima
              </label>

              <Select
                id="produtoSelect"
                options={listaProdutos
                  .filter((produto) => produto.categoria === "MATERIA_PRIMA")
                  .map((produto) => ({
                    value: produto.id,
                    label: produto.nome,
                  }))}
                value={produtoSelecionado}
                onChange={(selectedOption) =>
                  setProdutoSelecionado(selectedOption)
                }
                placeholder="Digite o nome do produto"
                styles={{
                  container: (provided) => ({
                    ...provided,
                    width: "100%",
                  }),
                }}
              />
            </div>

            <div className="field column">
              <label className="label" htmlFor="inputQuantidade">
                Qtd
              </label>

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

            <div className="control" style={{ marginTop: "30px" }}>
              <Button
                type="button"
                className="button is-link"
                onClick={adicionarItemProduto}
                style={{
                  width: "100%",
                  height: "38px",
                  boxSizing: "border-box",
                }}
              >
                Adicionar
              </Button>
            </div>
          </div>

          <div className="field">
            <h3>Insumos Utilizados na Produção</h3>
            <DataTable
              value={itensProduto}
              emptyMessage="Nenhum item adicionado."
            >
              <Column
                field="itemProdutoId"
                header="Produto"
                body={(rowData: ItensProduto) => {
                  const item = listaProdutos.find(
                    (p) => p.id === rowData.itemProdutoId
                  );
                  return item ? item.nome : "N/A";
                }}
              />
              <Column field="quantidade" header="Qtd" />
              <Column
                header="Tipo"
                body={(rowData: ItensProduto) => {
                  const item = listaProdutos.find(
                    (p) => p.id === rowData.itemProdutoId
                  );
                  return item ? item.tipo : "N/A";
                }}
              />
              <Column
                header="Vl. Unit"
                body={(rowData: ItensProduto) => {
                  const item = listaProdutos.find(
                    (p) => p.id === rowData.itemProdutoId
                  );
                  return item ? formatReal(item.preco || 0) : "0,00";
                }}
              />
              <Column
                header="Vl. Total"
                body={(rowData: ItensProduto) => {
                  const item = listaProdutos.find(
                    (p) => p.id === rowData.itemProdutoId
                  );
                  return item
                    ? formatReal(
                        calcularValorTotal(rowData.quantidade, item.preco || 0)
                      )
                    : "0,00";
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
              <strong>
                Total Geral: {formatReal(calcularSomatorioTotal())}
              </strong>
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
