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

      // Busca os insumos necessários para os próximos dias
      vendaService.listarInsumosNecessarios(user.id, dias).then((data) => {
        setInsumosNecessarios(data);
      });
    }
  }, [user, dias]);

  return (
    <div>
      <h2>Relatórios</h2>

      <div>
        <h3>Pedidos em Produção</h3>
        <DataTable value={vendasEmProducao}>
          <Column field="nomeCliente" header="Cliente" />
          <Column field="nomeProduto" header="Produto" />
          <Column field="quantidade" header="Quantidade" />
          <Column field="valorUnitario" header="Valor Unitário" />
          <Column field="valorTotal" header="Valor Total" />
          <Column field="dataEntrega" header="Data de Entrega" />
        </DataTable>
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
        </div>

        <DataTable value={insumosNecessarios}>
          <Column field="nomeProduto" header="Produto" />
          <Column field="quantidade" header="Quantidade Necessária" />
        </DataTable>
      </div>
    </div>
  );
};
