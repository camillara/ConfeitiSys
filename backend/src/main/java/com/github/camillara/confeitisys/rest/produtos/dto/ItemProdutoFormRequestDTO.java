package com.github.camillara.confeitisys.rest.produtos.dto;

import com.github.camillara.confeitisys.model.ItemProduto;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.repositories.ProdutoRepository;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemProdutoFormRequestDTO {

	private Long id;
	private Long produtoId;
	private Long itemProdutoId;
	private Integer quantidade;

	public static ItemProdutoFormRequestDTO fromModel(ItemProduto itemProduto) {
		return ItemProdutoFormRequestDTO.builder()
				.id(itemProduto.getId())
				.produtoId(itemProduto.getProduto() != null ? itemProduto.getProduto().getId() : null)
				.itemProdutoId(itemProduto.getItemProduto() != null ? itemProduto.getItemProduto().getId() : null)
				.quantidade(itemProduto.getQuantidade())
				.build();
	}

	public ItemProduto toModel(Produto produto, ProdutoRepository produtoRepository) {
		Produto itemProduto = itemProdutoId != null ? produtoRepository.findById(itemProdutoId).orElse(null) : null;
		return ItemProduto.builder()
				.id(this.id)
				.produto(produto)
				.itemProduto(itemProduto)
				.quantidade(this.quantidade)
				.build();
	}
}