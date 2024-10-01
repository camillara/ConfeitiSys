package com.github.camillara.confeitisys.rest.produtos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.enums.Categoria;
import lombok.*;

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

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate cadastro;

	public Produto toModel() {
		Produto produto = Produto.builder()
				.id(id)
				.nome(nome)
				.descricao(descricao)
				.preco(preco)
				.categoria(categoria)
				.build();
		produto.setDataCadastro(cadastro != null ? cadastro : produto.getDataCadastro());
		return produto;
	}

	public static ProdutoFormRequestDTO fromModel(Produto produto) {
		return ProdutoFormRequestDTO.builder()
				.id(produto.getId())
				.descricao(produto.getDescricao())
				.nome(produto.getNome())
				.preco(produto.getPreco())
				.categoria(produto.getCategoria())
				.cadastro(produto.getDataCadastro())
				.build();
	}
}