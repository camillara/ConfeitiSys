package com.github.camillara.confeitisys.rest.vendas.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemVendaFormRequestDTO {
	private Long id;
	private Long idProduto;
	private Integer quantidade;
}