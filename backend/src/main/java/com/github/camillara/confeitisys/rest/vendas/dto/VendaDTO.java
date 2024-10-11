package com.github.camillara.confeitisys.rest.vendas.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.camillara.confeitisys.model.Cliente;
import com.github.camillara.confeitisys.model.enums.FormaPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPedido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendaDTO {
	private Long id;
	private Cliente cliente;
	private FormaPagamento formaPagamento;
	private StatusPagamento statusPagamento;
	private StatusPedido statusPedido;
	private List<ItemVendaDTO> itens;
	private BigDecimal total;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate cadastro;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate dataEntrega;

	private String observacao;
}