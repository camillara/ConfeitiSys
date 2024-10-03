package com.github.camillara.confeitisys.rest.produtos.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.enums.Categoria;
import com.github.camillara.confeitisys.model.enums.Tipo;
import com.github.camillara.confeitisys.model.repositories.ProdutoRepository;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoFormRequestDTO {

	private Long id;
	private String descricao;
	private String nome;
	private BigDecimal preco;
	private Categoria categoria;
	private Tipo tipo;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate cadastro;

	private List<ItemProdutoFormRequestDTO> itensProduto;

	public Produto toModel() {
		Produto produto = Produto.builder()
				.id(id)
				.nome(nome)
				.descricao(descricao)
				.preco(preco)
				.categoria(categoria)
				.tipo(tipo)
				.build();
		produto.setDataCadastro(cadastro != null ? cadastro : produto.getDataCadastro());
		return produto;
	}

	public Produto toModel(ProdutoRepository produtoRepository) {
		Produto produto = toModel();
		produto.setItensProduto(itensProduto != null ? itensProduto.stream()
				.map(dto -> dto.toModel(produto, produtoRepository))
				.collect(Collectors.toList()) : null);
		return produto;
	}

	public static ProdutoFormRequestDTO fromModel(Produto produto) {
		return ProdutoFormRequestDTO.builder()
				.id(produto.getId())
				.descricao(produto.getDescricao())
				.nome(produto.getNome())
				.preco(produto.getPreco())
				.categoria(produto.getCategoria())
				.tipo(produto.getTipo())
				.cadastro(produto.getDataCadastro())
				.itensProduto(produto.getItensProduto() != null ? produto.getItensProduto().stream()
						.map(ItemProdutoFormRequestDTO::fromModel)
						.collect(Collectors.toList()) : null)
				.build();
	}
}