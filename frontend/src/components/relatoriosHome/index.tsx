import { useState, useEffect } from "react";
import { useVendaService } from "app/services"; // Serviço de vendas criado
import { PedidosProducao, VendasPorStatus, InsumoNecessario } from "app/models/vendas";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useUser } from "context/UserContext"; // Contexto de usuário

export const RelatoriosHome = () => {
  const [vendasEmProducao, setVendasEmProducao] = useState<PedidosProducao[]>([]);
  const [relatorioVendas, setRelatorioVendas] = useState<VendasPorStatus[]>([]);
  const [insumosNecessarios, setInsumosNecessarios] = useState<InsumoNecessario[]>([]);
  const [dias, setDias] = useState(7); // Número de dias para o relatório de insumos
  const [visibleRows, setVisibleRows] = useState(10); // Controla o número de linhas visíveis inicialmente
  const { user } = useUser(); // Acessa o usuário logado
  const vendaService = useVendaService();

  // Carregar as vendas em produção e relatório de vendas uma única vez ao montar o componente
  useEffect(() => {
    if (user) {
      console.log("Buscando dados de vendas em produção e relatórios...");
      vendaService.listarVendasEmProducao(user.id).then((data) => {
        setVendasEmProducao(data);
      });

      vendaService.gerarRelatorioPorFormaPagamentoEPeriodo(user.id, new Date(), new Date()).then((data) => {
        setRelatorioVendas(data);
      });
    }
  }, [user]); // Executa apenas quando o usuário estiver disponível (carregamento único)

  // Função chamada ao clicar no botão "Ver mais"
  const mostrarMaisLinhas = () => {
    setVisibleRows((prevVisibleRows) => prevVisibleRows + 10); // Aumenta o número de linhas visíveis em 10
  };

  // Função para buscar insumos necessários (chamada ao clicar em um botão, não no useEffect)
  const buscarInsumos = () => {
    if (user) {
      vendaService.listarInsumosNecessarios(user.id, dias).then((data) => {
        setInsumosNecessarios(data);
      });
    }
  };

  return (
    <div>
      <h2>Relatórios</h2>

      <div>
        <h3>Pedidos em Produção</h3>
        <DataTable value={vendasEmProducao.slice(0, visibleRows)}>
          {/* Exibe apenas as linhas controladas por visibleRows */}
          <Column field="nomeCliente" header="Cliente" />
          <Column field="nomeProduto" header="Produto" />
          <Column field="quantidade" header="Quantidade" />
          <Column field="valorUnitario" header="Valor Unitário" />
          <Column field="valorTotal" header="Valor Total" />
          <Column field="dataEntrega" header="Data de Entrega" />
        </DataTable>
        {visibleRows < vendasEmProducao.length && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Button label="Ver mais" onClick={mostrarMaisLinhas} />
          </div>
        )}
      </div>

      <div>
        <h3>Relatório de Vendas</h3>
        <DataTable value={relatorioVendas}>
          <Column field="formaPagamento" header="Forma de Pagamento" />
          <Column field="totalPagas" header="Total Pagas" />
          <Column field="totalPendentes" header="Total Pendentes" />
          <Column field="valorTotal" header="Valor Total" />
        </DataTable>
      </div>

      <div>
        <h3>Insumos Necessários</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="dias">Dias: </label>
          <input
            type="number"
            id="dias"
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
          />
          <Button label="Buscar Insumos" onClick={buscarInsumos} /> {/* Botão para buscar insumos */}
        </div>

        <DataTable value={insumosNecessarios}>
          <Column field="nomeProduto" header="Produto" />
          <Column field="quantidade" header="Quantidade Necessária" />
        </DataTable>
      </div>
    </div>
  );
};
