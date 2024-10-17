import { useState, useEffect } from "react";
import { useVendaService } from "app/services"; // Serviço de vendas criado
import { PedidosProducao, VendasPorStatus, InsumoNecessario } from "app/models/vendas";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useUser } from "context/UserContext"; // Contexto de usuário
import { Button } from "primereact/button"; // Botão para "Ver mais"

export const RelatoriosHome = () => {
  const [vendasEmProducao, setVendasEmProducao] = useState<PedidosProducao[]>([]);
  const [relatorioVendas, setRelatorioVendas] = useState<VendasPorStatus[]>([]);
  const [insumosNecessarios, setInsumosNecessarios] = useState<InsumoNecessario[]>([]);
  const [dias, setDias] = useState(7); // Número de dias para o relatório de insumos
  const [visibleRows, setVisibleRows] = useState(10); // Controla o número de linhas visíveis inicialmente
  const { user } = useUser(); // Acessa o usuário logado
  const vendaService = useVendaService();

  useEffect(() => {
    if (user) {
      // Busca as vendas em produção
      vendaService.listarVendasEmProducao(user.id).then((data) => {
        setVendasEmProducao(data);
      });

      // Busca o relatório de vendas por status
      vendaService.gerarRelatorioPorFormaPagamentoEPeriodo(user.id, new Date(), new Date()).then((data) => {
        setRelatorioVendas(data);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Atualiza a lista de insumos necessários quando o número de dias muda
      vendaService.listarInsumosNecessarios(user.id, dias).then(setInsumosNecessarios);
    }
  }, [user, dias]);

  // Função chamada ao clicar no botão "Ver mais"
  const mostrarMaisLinhas = () => {
    setVisibleRows((prevVisibleRows) => prevVisibleRows + 10); // Aumenta o número de linhas visíveis em 10
  };

  return (
    <div>
      <h2>Relatórios</h2>

      <div>
        <h3>Pedidos em Produção</h3>
        <DataTable value={vendasEmProducao.slice(0, visibleRows)} scrollable scrollHeight="400px">
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
        <DataTable value={relatorioVendas} scrollable scrollHeight="400px"> {/* Definindo altura fixa com rolagem */}
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
            onChange={(e) => setDias(Number(e.target.value))} // Atualiza automaticamente ao mudar o número de dias
          />
        </div>

        <DataTable value={insumosNecessarios} scrollable scrollHeight="400px"> {/* Definindo altura fixa com rolagem */}
          <Column field="nomeProduto" header="Produto" />
          <Column field="quantidade" header="Quantidade Necessária" />
        </DataTable>
      </div>
    </div>
  );
};
