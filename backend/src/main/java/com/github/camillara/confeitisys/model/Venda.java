package com.github.camillara.confeitisys.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import javax.persistence.*;
import com.github.camillara.confeitisys.model.enums.FormaPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPedido;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "tb_venda")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@ToString
public class Venda {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "id_cliente")
	private Cliente cliente;

	@Enumerated(EnumType.STRING)
	@Column(name = "forma_pagamento")
	private FormaPagamento formaPagamento;

	@Enumerated(EnumType.STRING)
	@Column(name = "status_pagamento")
	private StatusPagamento statusPagamento;

	@Enumerated(EnumType.STRING)
	@Column(name = "status_pedido")
	private StatusPedido statusPedido;

	@OneToMany(mappedBy = "venda", cascade = CascadeType.ALL)
	private List<ItemVenda> itens;

	@Column
	private BigDecimal total;

	@Column(name = "data_de_cadastro")
	private LocalDate dataCadastro;

	@Column(name = "data_de_entrega")
	private LocalDate dataEntrega;

	@Column(name = "observacao", length = 255)
	private String observacao;

	@ManyToOne(fetch = FetchType.LAZY) // Relacionamento ManyToOne com User
	@JoinColumn(name = "user_id", nullable = false) // FK para a tabela de usuários
	private User user;

	@PrePersist
	public void prePersist() {
		setDataCadastro(LocalDate.now());
	}
}