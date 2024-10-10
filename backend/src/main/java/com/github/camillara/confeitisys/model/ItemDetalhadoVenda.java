package com.github.camillara.confeitisys.model;

import java.math.BigDecimal;
import javax.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_item_detalhado_venda")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@ToString
public class ItemDetalhadoVenda {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "id_item_venda")
	private ItemVenda itemVenda;

	@ManyToOne
	@JoinColumn(name = "id_produto")
	private Produto produto;

	@Column(name = "quantidade_usada")
	private Integer quantidadeUsada;

	@Column(name = "custo_insumo")
	private BigDecimal custoInsumoNoMomento;
}
