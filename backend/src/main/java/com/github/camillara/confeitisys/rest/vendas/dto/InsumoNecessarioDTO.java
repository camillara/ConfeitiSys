package com.github.camillara.confeitisys.rest.vendas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsumoNecessarioDTO {
	private Long idProduto;       // ID do insumo
	private String nomeProduto;   // Nome do insumo
	private Integer quantidade;   // Quantidade total necessária
}
