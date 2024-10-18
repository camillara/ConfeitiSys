import { useState, useEffect } from "react";
import { useVendaService } from "app/services"; // Serviço de vendas criado
import {
  PedidosProducao,
  VendasPorStatus,
  InsumoNecessario,
} from "app/models/vendas";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar"; // Componente de calendário para selecionar datas
import { useUser } from "context/UserContext"; // Contexto de usuário

const formatarData = (data: string | Date) => {
  if (!data) return "";
  // Se o tipo for string, converter para Date
  const dateObj =
    typeof data === "string"
      ? new Date(data.split("/").reverse().join("-"))
      : new Date(data);
  const dia = String(dateObj.getDate()).padStart(2, "0");
  const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
  const ano = dateObj.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

// Função para formatar valor monetário, alinhando R$ à esquerda e valor à direita
const formatarMoeda = (valor: number) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>R$</span>
      <span style={{ marginLeft: "auto", textAlign: "right", width: "100%" }}>
        {valor.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  );
};

export const RelatoriosHome = () => {
  const [vendasEmProducao, setVendasEmProducao] = useState<PedidosProducao[]>(
    []
  );
  const [relatorioVendas, setRelatorioVendas] = useState<VendasPorStatus[]>([]);
  const [insumosNecessarios, setInsumosNecessarios] = useState<
    InsumoNecessario[]
  >([]);
  const [dias, setDias] = useState(7); // Número de dias para o relatório de insumos
  const [dataInicio, setDataInicio] = useState<Date | null>(new Date()); // Data de início
  const [dataFim, setDataFim] = useState<Date | null>(new Date()); // Data de fim
  const [visibleRows, setVisibleRows] = useState(10); // Controla o número de linhas visíveis inicialmente
  const { user } = useUser(); // Acessa o usuário logado
  const vendaService = useVendaService();

  // Função para buscar relatório de vendas quando as datas mudarem ou ao carregar a página
  const buscarRelatorioVendas = () => {
    if (user && dataInicio && dataFim) {
      vendaService
        .gerarRelatorioPorFormaPagamentoEPeriodo(user.id, dataInicio, dataFim)
        .then((data) => {
          setRelatorioVendas(data);
        });
    }
  };

  const calcularTotais = () => {
    let totalPagas = 0;
    let totalPendentes = 0;
    let valorTotal = 0;

    relatorioVendas.forEach((venda) => {
      totalPagas += venda.totalPagas || 0;
      totalPendentes += venda.totalPendentes || 0;
      valorTotal += venda.valorTotal || 0;
    });

    return { totalPagas, totalPendentes, valorTotal };
  };

  const totais = calcularTotais();

  // Carregar vendas em produção ao montar o componente
  useEffect(() => {
    if (user) {
      vendaService.listarVendasEmProducao(user.id).then((data) => {
        setVendasEmProducao(data);
      });

      // Busca inicial dos insumos
      vendaService.listarInsumosNecessarios(user.id, dias).then((data) => {
        setInsumosNecessarios(data);
      });

      // Carrega o relatório de vendas pela primeira vez
      buscarRelatorioVendas();
    }
  }, [user]);

  // Função chamada ao clicar no botão "Ver mais" na tabela de produção
  const mostrarMaisLinhas = () => {
    setVisibleRows((prevVisibleRows) => prevVisibleRows + 10); // Aumenta o número de linhas visíveis em 10
  };

  return (
    <div>
      <h2>Relatórios</h2>

      <div>
        <h3>Pedidos em Produção</h3>
        {/* Configuração para rolagem e altura fixa */}
        <DataTable
          value={vendasEmProducao.slice(0, visibleRows)}
          scrollable
          scrollHeight="400px"
        >
          {/* Nova coluna para exibir o ID do pedido */}
          <Column field="id" header="ID do Pedido" />

          <Column field="nomeCliente" header="Cliente" />
          <Column field="nomeProduto" header="Produto" />
          <Column field="quantidade" header="Quantidade" />
          <Column
            field="valorUnitario"
            header="Valor Unitário"
            body={(rowData) => formatarMoeda(rowData.valorUnitario)}
          />
          <Column
            field="valorTotal"
            header="Valor Total"
            body={(rowData) => formatarMoeda(rowData.valorTotal)}
          />
          <Column
            field="dataEntrega"
            header="Data de Entrega"
            body={(rowData) => formatarData(rowData.dataEntrega)} // Formata a data para o formato brasileiro
          />
        </DataTable>
        {visibleRows < vendasEmProducao.length && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <Button label="Ver mais" onClick={mostrarMaisLinhas} />
          </div>
        )}
      </div>
      <br />
      <br />

      <div>
        <h3>Relatório Financeiro Período</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="dataInicio">Data Venda Início: </label>
          <Calendar
            id="dataInicio"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.value as Date)}
            dateFormat="dd/mm/yy" // Formato de data
            showIcon
          />

          <label htmlFor="dataFim" style={{ marginLeft: "1rem" }}>
            Data Venda Final:
          </label>
          <Calendar
            id="dataFim"
            value={dataFim}
            onChange={(e) => setDataFim(e.value as Date)}
            dateFormat="dd/mm/yy" // Formato de data
            showIcon
          />

          <Button
            label="Gerar Relatório"
            onClick={buscarRelatorioVendas}
            style={{ marginLeft: "1rem" }}
          />
        </div>

        <DataTable value={relatorioVendas} scrollable scrollHeight="400px">
          <Column field="formaPagamento" header="Forma de Pagamento" />
          <Column
            field="totalPagas"
            header="Total Pagas"
            body={(rowData) => formatarMoeda(rowData.totalPagas)} // Formatação de valores para moeda brasileira
            footer={formatarMoeda(totais.totalPagas)} // Exibe a soma na coluna de "Total Pagas"
            footerStyle={{ fontWeight: "bold", backgroundColor: "#f0f8ff" }} // Estilo para a linha de totais
          />
          <Column
            field="totalPendentes"
            header="Total Pendentes"
            body={(rowData) => formatarMoeda(rowData.totalPendentes)} // Formatação de valores para moeda brasileira
            footer={formatarMoeda(totais.totalPendentes)} // Exibe a soma na coluna de "Total Pendentes"
            footerStyle={{ fontWeight: "bold", backgroundColor: "#f0f8ff" }} // Estilo para a linha de totais
          />
          <Column
            field="valorTotal"
            header="Valor Total"
            body={(rowData) => formatarMoeda(rowData.valorTotal)} // Formatação de valores para moeda brasileira
            footer={formatarMoeda(totais.valorTotal)} // Exibe a soma na coluna de "Valor Total"
            footerStyle={{ fontWeight: "bold", backgroundColor: "#f0f8ff" }} // Estilo para a linha de totais
          />
        </DataTable>
      </div>

      <br />
      <br />
      <div>
        <h3>Insumos Necessários</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="dias">Dias: </label>
          <input
            type="number"
            id="dias"
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
          />
        </div>

        <DataTable value={insumosNecessarios} scrollable scrollHeight="400px">
          <Column field="nomeProduto" header="Produto" />
          <Column field="quantidade" header="Quantidade Necessária" />
        </DataTable>
      </div>
    </div>
  );
};
