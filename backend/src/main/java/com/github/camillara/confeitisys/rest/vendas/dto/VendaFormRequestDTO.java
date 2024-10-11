package com.github.camillara.confeitisys.rest.vendas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.camillara.confeitisys.model.Cliente;
import com.github.camillara.confeitisys.model.enums.FormaPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPedido;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendaFormRequestDTO {
	private Long id;
	private Cliente cliente;
	private FormaPagamento formaPagamento;
	private StatusPagamento statusPagamento;
	private StatusPedido statusPedido;
	private List<ItemVendaFormRequestDTO> itens;
	private BigDecimal total;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate cadastro;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate dataEntrega;

	private String observacao;
}