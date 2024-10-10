package com.github.camillara.confeitisys.model;

import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_item_produto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@ToString
public class ItemProduto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Modificar o fetch type para EAGER para garantir que o produto seja carregado
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "produto_id")
	private Produto produto;

	@ManyToOne(fetch = FetchType.EAGER) // Também altere se necessário para carregar o itemProduto
	@JoinColumn(name = "item_produto_id")
	private Produto itemProduto;

	private Integer quantidade;

	public BigDecimal calcularValorTotal() {
		if (this.produto == null) {
			throw new IllegalStateException("Produto não pode ser nulo ao calcular o valor total.");
		}
		return this.produto.getPreco().multiply(new BigDecimal(this.quantidade));
	}
}
