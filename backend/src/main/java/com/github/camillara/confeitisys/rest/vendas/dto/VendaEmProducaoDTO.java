package com.github.camillara.confeitisys.rest.vendas.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.camillara.confeitisys.model.Cliente;
import com.github.camillara.confeitisys.model.enums.FormaPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPedido;
import lombok.*;
import org.aspectj.apache.bcel.classfile.LineNumber;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Getter
@Setter
@NoArgsConstructor
@Builder
public class VendaEmProducaoDTO {
    private Long id;
    private String nomeCliente;
    private String nomeProduto;
    private Integer quantidade;
    private BigDecimal valorUnitario;
    private BigDecimal valorTotal;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dataEntrega;

    public VendaEmProducaoDTO(Long id, String nomeCliente, String nomeProduto, Integer quantidade, BigDecimal valorUnitario, BigDecimal valorTotal, LocalDate dataEntrega) {
        this.id = id;
        this.nomeCliente = nomeCliente;
        this.nomeProduto = nomeProduto;
        this.quantidade = quantidade;
        this.valorUnitario = valorUnitario;
        this.valorTotal = valorTotal;
        this.dataEntrega = dataEntrega;
    }
}
