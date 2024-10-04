import React from 'react';
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
  AutoCompleteCompleteMethodParams,
} from "primereact/autocomplete";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const msgCampoObrigatorio = "Campo Obrigatório";

const validationSchema = yup.object().shape({
  categoria: yup.string().trim().required(msgCampoObrigatorio),
  tipo: yup.string().trim().required(msgCampoObrigatorio),
  nome: yup.string().trim().required(msgCampoObrigatorio),
  descricao: yup
    .string()
    .trim()
    .required(msgCampoObrigatorio)
    .min(10, "Deve possuir pelo menos 10 caracteres."),
  preco: yup
    .number()
    .required(msgCampoObrigatorio)
    .moreThan(0, "Valor deve ser maior que 0,00 Zero"),
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
  const [tipo, setTipo] = useState<string>(""); // Estado para o tipo
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
      itensProduto,
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
                texto: "Produto Salvo com sucesso!",
              },
            ]);
          });
        }
      })
      .catch((error) => {
        const field = error.path;
        const message = error.message;

        setErrors({
          [field]: message,
        });
      });
  };

  const adicionarItemProduto = () => {
    if (produtoSelecionado) {
      const itemProduto: ItensProduto = {
        produtoId: Number(produtoSelecionado.id),
        itemProdutoId: Number(produtoSelecionado.id),
        quantidade: quantidade,
      };
      setItensProduto([...itensProduto, itemProduto]);
      // Limpar os campos após adicionar
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
    const produtosFiltrados = listaProdutos.filter((produto) =>
      produto.nome && produto.nome.toUpperCase().includes(event.query.toUpperCase())
    );
    setListaFiltradaProdutos(produtosFiltrados);
  };

  const handleProdutoChange = (e: any) => {
    setProdutoSelecionado(e.value);
  };

  const calcularValorTotal = (quantidade: number, valorUnitario: number = 0) => {
    return quantidade * (valorUnitario !== undefined ? valorUnitario : 0);
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
      {id && (
        <div className="columns">
          <Input
            label="Código:"
            columnClasses="is-half"
            value={id}
            id="inputId"
            disabled={true}
          />

          <Input
            label="Data do Cadastro:"
            columnClasses="is-half"
            value={cadastro}
            id="inputDataCadastro"
            disabled={true}
          />
        </div>
      )}

      <div className="columns">
        <div className="field column is-half">
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
            />
            {errors.categoria && (
              <p className="help is-danger">{errors.categoria}</p>
            )}
          </div>
        </div>

        <div className="field column is-half">
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
            />
            {errors.tipo && (
              <p className="help is-danger">{errors.tipo}</p>
            )}
          </div>
        </div>
      </div>

      <div className="columns">
        <InputMoney
          label="Preço: *"
          columnClasses="is-half"
          onChange={(e) => setPreco(e.target.value)}
          value={preco}
          id="inputPreco"
          placeholder="Digite o Preço do produto"
          maxLength={16}
          error={errors.preco}
        />
      </div>

      <div className="columns">
        <Input
          label="Nome: *"
          columnClasses="is-full"
          onChange={(e) => setNome(e.target.value)}
          value={nome}
          id="inputNome"
          placeholder="Digite o Nome do produto"
          error={errors.nome}
        />
      </div>

      <div className="columns">
        <div className="field is-full column">
          <label className="label" htmlFor="inputDescricao">
            Descrição: *
          </label>
          <div className="control">
            <textarea
              className="textarea"
              id="inputDescricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Digite a Descrição detalhada do produto"
            />
            {errors.descricao && (
              <p className="help is-danger">{errors.descricao}</p>
            )}
          </div>
        </div>
      </div>

      <div className="columns">
        <div className="field column is-half">
          <label className="label" htmlFor="produtoAutocomplete">
            Nome do Item Produto
          </label>
          <div className="control">
            <AutoComplete
              id="produtoAutocomplete"
              value={produtoSelecionado}
              suggestions={listaFiltradaProdutos}
              completeMethod={handleProdutoAutoComplete}
              field="nome"
              onChange={handleProdutoChange}
            />
          </div>
        </div>

        <div className="field column is-half">
          <label className="label" htmlFor="inputQuantidade">
            Quantidade
          </label>
          <div className="control">
            <Input
              id="inputQuantidade"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              label={""}
            />
          </div>
        </div>
      </div>

      <div className="field">
        <div className="control">
          <Button type="button" className="button is-link" onClick={adicionarItemProduto}>
            Adicionar Item Produto
          </Button>
        </div>
      </div>

      <div className="field">
        <h3>Itens do Produto</h3>
        <DataTable value={itensProduto} emptyMessage="Nenhum item adicionado.">
          <Column field="produtoId" header="ID do Produto" />
          <Column field="quantidade" header="Quantidade" />
          <Column
            header="Valor Unitário"
            body={(rowData: ItensProduto) => {
              const item = listaProdutos.find((p) => p.id === rowData.produtoId);
              return item ? formatReal(item.preco || 0) : "0,00";
            }}
          />
          <Column
            header="Valor Total"
            body={(rowData: ItensProduto) => {
              const item = listaProdutos.find((p) => p.id === rowData.produtoId);
              return item ? formatReal(calcularValorTotal(rowData.quantidade, item.preco || 0)) : "0,00";
            }}
          />
        </DataTable>
      </div>

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
