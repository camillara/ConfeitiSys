package com.github.camillara.confeitisys.rest.produtos;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.camillara.confeitisys.model.Produto;

public class ProdutoFormRequestDTO {

	private Long id;
	private String descricao;
	private String nome;
	private BigDecimal preco;
	private String categoria;
	
	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate cadastro;

	// Metodos
	public Produto toModel() {
	    Produto produto = new Produto(id, nome, descricao, preco, categoria);
	    produto.setDataCadastro(cadastro != null ? cadastro : produto.getDataCadastro());
	    return produto;
	}


	public static ProdutoFormRequestDTO fromModel(Produto produto) {
		return new ProdutoFormRequestDTO(
				produto.getId(), 
				produto.getDescricao(), 
				produto.getNome(), 
				produto.getPreco(),
				produto.getCategoria(),
				produto.getDataCadastro());
	}

	// Construtores
	public ProdutoFormRequestDTO() {
		super();
	}

	public ProdutoFormRequestDTO(Long id, String descricao, String nome, BigDecimal preco, String categoria,
			LocalDate cadastro) {
		super();
		this.id = id;
		this.descricao = descricao;
		this.nome = nome;
		this.preco = preco;
		this.categoria = categoria;
		this.cadastro = cadastro;
	}


	// get e set
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
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

	public void setSku(String categoria) {
		this.categoria = categoria;
	}

	public LocalDate getCadastro() {
		return cadastro;
	}

	public void setCadastro(LocalDate cadastro) {
		this.cadastro = cadastro;
	}

	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("ProdutoFromRequestDTO [id=");
		builder.append(id);
		builder.append(", descricao=");
		builder.append(descricao);
		builder.append(", nome=");
		builder.append(nome);
		builder.append(", preco=");
		builder.append(preco);
		builder.append(", categoria=");
		builder.append(categoria);
		builder.append("]");
		return builder.toString();
	}

}
