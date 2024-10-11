package com.github.camillara.confeitisys.rest.vendas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDetalhadoVendaFormRequestDTO {
	private Long id;
	private Long idProduto;
	private Integer quantidade;
}