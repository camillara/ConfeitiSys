package com.github.camillara.confeitisys.rest.vendas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVendaDTO {
	private Long id;
	private Long idProduto;
	private String nomeProduto;
	private Integer quantidade;
	private BigDecimal preco;
	private List<ItemDetalhadoVendaDTO> itens;
}