package com.github.camillara.confeitisys.model;

import javax.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_item_venda")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@ToString
public class ItemVenda {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "id_venda")
	private Venda venda;

	@ManyToOne
	@JoinColumn(name = "id_produto")
	private Produto produto;

	@Column
	private Integer quantidade;
}