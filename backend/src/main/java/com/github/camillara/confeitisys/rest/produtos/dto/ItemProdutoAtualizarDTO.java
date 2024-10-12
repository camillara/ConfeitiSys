package com.github.camillara.confeitisys.rest.produtos.dto;

import com.github.camillara.confeitisys.model.ItemProduto;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.repositories.ProdutoRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemProdutoAtualizarDTO {

	private Long produtoId;
	private String categoria;
	private String nome;
	private String tipo;
	private BigDecimal precoUnitario;
	private Integer qtd;
	private BigDecimal total;

}