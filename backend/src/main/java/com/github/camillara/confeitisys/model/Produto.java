package com.github.camillara.confeitisys.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import javax.persistence.*;

import com.github.camillara.confeitisys.model.enums.Categoria;
import com.github.camillara.confeitisys.model.enums.Tipo;
import lombok.*;

@Entity
@Table(name = "tb_produto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@ToString
public class Produto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "nome", length = 100)
	private String nome;

	@Column(name = "descricao", length = 255)
	private String descricao;

	@Column(name = "preco", precision = 16, scale = 2)
	private BigDecimal preco;

	@Enumerated(EnumType.STRING)
	@Column(name = "categoria")
	private Categoria categoria;

	@Enumerated(EnumType.STRING)
	@Column(name = "tipo")
	private Tipo tipo;

	@Column(name = "data_de_cadastro")
	private LocalDate dataCadastro;

	@OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ItemProduto> itensProduto;

	@ManyToOne(fetch = FetchType.LAZY) // Relacionamento ManyToOne com User
	@JoinColumn(name = "user_id", nullable = false) // FK para a tabela de usuários
	private User user;

	@PrePersist
	public void prePersist() {
		setDataCadastro(LocalDate.now());
	}
}