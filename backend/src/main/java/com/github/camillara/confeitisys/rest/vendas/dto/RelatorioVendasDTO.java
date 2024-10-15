package com.github.camillara.confeitisys.rest.vendas.dto;

import com.github.camillara.confeitisys.model.enums.FormaPagamento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor

public class RelatorioVendasDTO {
    private FormaPagamento formaPagamento;
    private BigDecimal totalPagas;
    private BigDecimal totalPendentes;
    private BigDecimal valorTotal;

    public RelatorioVendasDTO(FormaPagamento formaPagamento, BigDecimal totalPagas, BigDecimal totalPendentes, BigDecimal valorTotal) {
        this.formaPagamento = formaPagamento;
        this.totalPagas = totalPagas;
        this.totalPendentes = totalPendentes;
        this.valorTotal = valorTotal;
    }
}
