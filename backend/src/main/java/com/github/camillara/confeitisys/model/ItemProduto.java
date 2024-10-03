package com.github.camillara.confeitisys.model;

import lombok.*;

import javax.persistence.*;

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

	@ManyToOne
	@JoinColumn(name = "produto_id")
	private Produto produto;

	@ManyToOne
	@JoinColumn(name = "item_produto_id")
	private Produto itemProduto;

	private Integer quantidade;
}