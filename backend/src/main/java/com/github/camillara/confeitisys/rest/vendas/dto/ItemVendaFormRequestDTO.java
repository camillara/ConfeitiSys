package com.github.camillara.confeitisys.rest.vendas.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVendaFormRequestDTO {
	private Long id;
	private Long idProduto;
	private String nomeProduto;
	private Integer quantidade;
	private BigDecimal valorUnitario;
	private List<ItemDetalhadoVendaFormRequestDTO> itens;
}