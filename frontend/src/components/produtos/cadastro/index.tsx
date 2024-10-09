import React, { useState, useEffect, useRef } from "react";
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
import Select from "react-select";
import { Toast } from "primereact/toast";

// Mensagem de campo obrigatório
const msgCampoObrigatorio = "Campo Obrigatório";

// Validação com yup
const validationSchema = yup.object().shape({
  categoria: yup.string().required(msgCampoObrigatorio),
  tipo: yup.string().required(msgCampoObrigatorio),
  nome: yup.string().trim().required(msgCampoObrigatorio),
  preco: yup
    .number()
    .required(msgCampoObrigatorio)
    .moreThan(0, "Valor deve ser maior que 0,00 Zero"),
  descricao: yup.string().trim(),
});

// Tipos de erros do formulário
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
  const [categoria, setCategoria] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
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
  const toast = useRef<Toast>(null); // Adicionando o toast

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

  useEffect(() => {
    service.listar().then((produtosEncontrados) => {
      setListaProdutos(produtosEncontrados);
    });
  }, []);

  useEffect(() => {
    if (queryId) {
      service.carregarProduto(queryId).then((produtoEncontrado: Produto) => {
        setId(produtoEncontrado.id);
        setCategoria(produtoEncontrado.categoria || "");
        setTipo(produtoEncontrado.tipo || "");
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
      categoria: categoria || "",
      tipo: tipo || "",
      preco: converterEmBigDecimal(preco),
      nome,
      descricao,
      itensProduto: itensProduto.length > 0 ? itensProduto : [],
    };

    validationSchema
      .validate(produto)
      .then(() => {
        setErrors({});
        if (id) {
          service
            .atualizar(produto)
            .then(() => {
              setMessages([
                {
                  tipo: "success",
                  texto: "Produto atualizado com sucesso!",
                },
              ]);
            })
            .catch((error) => {
              toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: error.response?.data || "Erro ao atualizar o produto!",
              });
            });
        } else {
          service
            .salvar(produto)
            .then((produtoResposta) => {
              setId(produtoResposta.id);
              setCadastro(produtoResposta.cadastro);
              setMessages([
                {
                  tipo: "success",
                  texto: "Produto salvo com sucesso!",
                },
              ]);
            })
            .catch((error) => {
              toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: error.response?.data || "Erro ao salvar o produto!",
              });
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
      <Toast ref={toast} />
      {(id || cadastro) && (
        <div className="columns" style={{ gap: "1rem" }}>
          <div className="column is-3">
            <Input
              label="Código:"
              value={id || ""}
              id="inputId"
              disabled={true}
            />
          </div>

          <div className="column is-3">
            <Input
              label="Data do Cadastro:"
              value={cadastro || ""}
              id="inputDataCadastro"
              disabled={true}
            />
          </div>
        </div>
      )}

      <div className="columns" style={{ gap: "1rem" }}>
        <div className="column is-3">
          <label className="label" htmlFor="inputCategoria">
            Categoria: *
          </label>
          <Select
            id="inputCategoria"
            options={categorias}
            value={categorias.find((cat) => cat.value === categoria)} // Usando string
            onChange={(selectedOption) =>
              setCategoria(selectedOption?.value || "")
            }
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

        <div className="column is-3">
          <label className="label" htmlFor="inputTipo">
            Tipo: *
          </label>
          <Select
            id="inputTipo"
            options={tipos}
            value={tipos.find((t) => t.value === tipo)} // Usando string
            onChange={(selectedOption) => setTipo(selectedOption?.value || "")} // Passando apenas string
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

      <div className="columns" style={{ gap: "1rem" }}>
        <div className="column is-8">
          <Input
            label="Nome: *"
            value={nome}
            id="inputNome"
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o Nome do produto"
            error={errors.nome}
          />
        </div>

        <div className="column is-4">
          <InputMoney
            label="Preço: *"
            value={preco}
            id="inputPreco"
            onChange={(e) => setPreco(e.target.value)}
            placeholder="Digite o Preço do produto"
            maxLength={16}
            error={errors.preco}
          />
        </div>
      </div>
      <div className="columns is-flex" style={{ gap: "1rem" }}>
        <div className="column" style={{ textAlign: "left" }}>
          <label className="label" htmlFor="inputDescricao">
            Descrição
          </label>
          <textarea
            className="textarea descricao-textarea"
            id="inputDescricao"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Digite a Descrição detalhada do produto"
          />
        </div>
      </div>
      {categoria !== "MATERIA_PRIMA" && (
        <>
          <div className="columns" style={{ gap: "1rem" }}>
            <div className="column is-8">
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

            <div className="column is-4">
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
                  width: "95%",
                  height: "38px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div className="columns is-flex" style={{ gap: "1rem" }}>
            <div className="column" style={{ textAlign: "right" }}>
              <label className="label" style={{ visibility: "hidden" }}>
                Botão Adicionar
              </label>
              <Button
                type="button"
                className="button is-link"
                onClick={adicionarItemProduto}
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
              >
                + Adicionar Insumo
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
      
      {categoria === "MATERIA_PRIMA" && (
        <div className="field">
          <h3>Produtos que utilizam este item</h3>
          <DataTable
            value={listaProdutos.filter((produto) =>
              produto.itensProduto.some(
                (item) => item.itemProdutoId === Number(id)
              )
            )}
            emptyMessage="Nenhum produto utiliza este item."
          >
            <Column field="id" header="Código" />
            <Column field="nome" header="Nome do Produto" />
            <Column
              header="Quantidade Utilizada"
              body={(rowData: Produto) => {
                const itemProduto = rowData.itensProduto.find(
                  (item) => item.itemProdutoId === Number(id)
                );
                return itemProduto ? itemProduto.quantidade : "N/A";
              }}
            />
            <Column
              header="Ações"
              body={(rowData: Produto) => (
                <Button
                  type="button"
                  label="Ver Produto"
                  className="p-button-info"
                  onClick={() =>
                    router.push(`/cadastros/produtos?id=${rowData.id}`)
                  }
                />
              )}
            />
          </DataTable>
        </div>
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
