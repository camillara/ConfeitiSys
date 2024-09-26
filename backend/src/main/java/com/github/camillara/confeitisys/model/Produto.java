package com.github.camillara.confeitisys.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;

@Entity
@Table(name = "tb_produto")
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

	@Column(name = "categoria")
	private String categoria;

	@Column(name = "data_de_cadastro")
	private LocalDate dataCadastro;

	// Metodos
	@PrePersist
	public void prePersist() {
		setDataCadastro(LocalDate.now());
	}

	// construtores
	public Produto() {
		super();
	}

	public Produto(String nome, String descricao, BigDecimal preco, String categoria) {
		super();
		this.nome = nome;
		this.descricao = descricao;
		this.preco = preco;
		this.categoria = categoria;
	}

	public Produto(Long id, String nome, String descricao, BigDecimal preco, String categoria) {
		super();
		this.id = id;
		this.nome = nome;
		this.descricao = descricao;
		this.preco = preco;
		this.categoria = categoria;
	}

	// get e set
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public BigDecimal getPreco() {
		return preco;
	}

	public void setPreco(BigDecimal preco) {
		this.preco = preco;
	}

	public String getCategoria() {
		return categoria;
	}

	public void setCategoria(String sku) {
		this.categoria = categoria;
	}

	public LocalDate getDataCadastro() {
		return dataCadastro;
	}

	public void setDataCadastro(LocalDate dataCadastro) {
		this.dataCadastro = dataCadastro;
	}

	// to string
	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("Produto [id=");
		builder.append(id);
		builder.append(", nome=");
		builder.append(nome);
		builder.append(", descricao=");
		builder.append(descricao);
		builder.append(", preco=");
		builder.append(preco);
		builder.append(", categoria=");
		builder.append(categoria);
		builder.append(", dataCadastro=");
		builder.append(dataCadastro);
		builder.append("]");
		return builder.toString();
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((dataCadastro == null) ? 0 : dataCadastro.hashCode());
		result = prime * result + ((descricao == null) ? 0 : descricao.hashCode());
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		result = prime * result + ((nome == null) ? 0 : nome.hashCode());
		result = prime * result + ((preco == null) ? 0 : preco.hashCode());
		result = prime * result + ((categoria == null) ? 0 : categoria.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Produto other = (Produto) obj;
		if (dataCadastro == null) {
			if (other.dataCadastro != null)
				return false;
		} else if (!dataCadastro.equals(other.dataCadastro))
			return false;
		if (descricao == null) {
			if (other.descricao != null)
				return false;
		} else if (!descricao.equals(other.descricao))
			return false;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (nome == null) {
			if (other.nome != null)
				return false;
		} else if (!nome.equals(other.nome))
			return false;
		if (preco == null) {
			if (other.preco != null)
				return false;
		} else if (!preco.equals(other.preco))
			return false;
		if (categoria == null) {
			if (other.categoria != null)
				return false;
		} else if (!categoria.equals(other.categoria))
			return false;
		return true;
	}

}
