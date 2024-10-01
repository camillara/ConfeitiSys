package com.github.camillara.confeitisys.rest.vendas.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVendaFormRequestDTO {
	private Long id;
	private Long idProduto;
	private Integer quantidade;
}