import { useState, useEffect } from "react";
import { Layout, Input, InputMoney } from "components";
import { useProdutoService } from "app/services";
import { Produto } from "app/models/produtos";
import { converterEmBigDecimal, formatReal } from "app/util/money";
import { Alert } from "components/common/message";
import { Dropdown } from "primereact/dropdown"; // Importando o Dropdown
import * as yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";

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
  const [messages, setMessages] = useState<Array<Alert>>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const { id: queryId } = router.query;

  useEffect(() => {
    if (queryId) {
      service.carregarProduto(queryId).then((produtoEncontrado: any) => {
        setId(produtoEncontrado.id);
        setCategoria(produtoEncontrado.categoria);
        setTipo(produtoEncontrado.tipo);
        setNome(produtoEncontrado.nome);
        setDescricao(produtoEncontrado.descricao);
        setPreco(formatReal(`${produtoEncontrado.preco}`));
        setCadastro(produtoEncontrado.cadastro || ``);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId]);

  const submit = () => {
    const produto: Produto = {
      id,
      categoria,
      tipo,
      preco: converterEmBigDecimal(preco),
      nome,
      descricao,
    };

    validationSchema
      .validate(produto)
      .then((obj) => {
        setErrors({});
        if (id) {
          service.atualizar(produto).then((response) => {
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

        // console.log(JSON.parse(JSON.stringify(error)));
      });
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
    "UN",          // Unidade
    "GR",          // Gramas
    "ML",          // Mililitros
    "KG",          // Quilogramas
    "L",           // Litros
    "CX",          // Caixa
    "PC",          // Pacote
    "FT",          // Fatia
    "DZ",          // Dúzia
    "TBSP",        // Colher de sopa
    "TSP"          // Colher de chá
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
