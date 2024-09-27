package com.github.camillara.confeitisys.rest.vendas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.camillara.confeitisys.model.enums.FormaPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPagamento;
import com.github.camillara.confeitisys.model.enums.StatusPedido;

public class VendaFormRequestDTO {
	private Long id;
	private Long idCliente;
	private FormaPagamento formaPagamento;
	private StatusPagamento statusPagamento;
	private StatusPedido statusPedido;
	private List<ItemVendaFormRequestDTO> itens;
	private BigDecimal total;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate cadastro;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate dataEntrega;

	private String observacao;

	// constructors
	public VendaFormRequestDTO() {
		super();
	}

	public VendaFormRequestDTO(Long id, Long idCliente, FormaPagamento formaPagamento, StatusPagamento statusPagamento, StatusPedido statusPedido,
			List<ItemVendaFormRequestDTO> itens, BigDecimal total, LocalDate cadastro, LocalDate dataEntrega, String observacao) {
		super();
		this.id = id;
		this.idCliente = idCliente;
		this.formaPagamento = formaPagamento;
		this.statusPagamento = statusPagamento;
		this.statusPedido = statusPedido;
		this.itens = itens;
		this.total = total;
		this.cadastro = cadastro;
		this.dataEntrega = dataEntrega;
		this.observacao = observacao;
	}

	// get and set
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getIdCliente() {
		return idCliente;
	}

	public void setIdCliente(Long idCliente) {
		this.idCliente = idCliente;
	}

	public FormaPagamento getFormaPagamento() {
		return formaPagamento;
	}

	public void setFormaPagamento(FormaPagamento formaPagamento) {
		this.formaPagamento = formaPagamento;
	}

	public StatusPagamento getStatusPagamento() {
		return statusPagamento;
	}

	public void setStatusPagamento(StatusPagamento statusPagamento) {
		this.statusPagamento = statusPagamento;
	}

	public StatusPedido getStatusPedido() {
		return statusPedido;
	}

	public void setStatusPedido(StatusPedido statusPedido) {
		this.statusPedido = statusPedido;
	}

	public List<ItemVendaFormRequestDTO> getItens() {
		return itens;
	}

	public void setItens(List<ItemVendaFormRequestDTO> itens) {
		this.itens = itens;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public LocalDate getCadastro() {
		return cadastro;
	}

	public void setCadastro(LocalDate cadastro) {
		this.cadastro = cadastro;
	}

	public LocalDate getDataEntrega() {
		return dataEntrega;
	}

	public void setDataEntrega(LocalDate dataEntrega) {
		this.dataEntrega = dataEntrega;
	}

	public String getObservacao() {
		return observacao;
	}

	public void setObservacao(String observacao) {
		this.observacao = observacao;
	}

	@Override
	public String toString() {
		return "VendaFormRequestDTO [id=" + id + ", idCliente=" + idCliente + ", formaPagamento=" + formaPagamento
				+ ", itens=" + itens + ", total=" + total + ", cadastro=" + cadastro + ", dataEntrega=" + dataEntrega + ", observacao=" + observacao +"]";
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((formaPagamento == null) ? 0 : formaPagamento.hashCode());
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		result = prime * result + ((idCliente == null) ? 0 : idCliente.hashCode());
		result = prime * result + ((itens == null) ? 0 : itens.hashCode());
		result = prime * result + ((total == null) ? 0 : total.hashCode());
		result = prime * result + ((cadastro == null) ? 0 : cadastro.hashCode());
		result = prime * result + ((dataEntrega == null) ? 0 : dataEntrega.hashCode());
		result = prime * result + ((observacao == null) ? 0 : observacao.hashCode());
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
		VendaFormRequestDTO other = (VendaFormRequestDTO) obj;
		if (formaPagamento != other.formaPagamento)
			return false;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (idCliente == null) {
			if (other.idCliente != null)
				return false;
		} else if (!idCliente.equals(other.idCliente))
			return false;
		if (itens == null) {
			if (other.itens != null)
				return false;
		} else if (!itens.equals(other.itens))
			return false;
		if (total == null) {
			if (other.total != null)
				return false;
		} else if (!total.equals(other.total))
			return false;
		if (cadastro == null) {
			if (other.cadastro != null)
				return false;
		} else if (!cadastro.equals(other.cadastro))
			return false;
		if (dataEntrega == null) {
			if (other.dataEntrega != null)
				return false;
		} else if (!dataEntrega.equals(other.dataEntrega))
			return false;
		if (observacao == null) {
			if (other.observacao != null)
				return false;
		} else if (!observacao.equals(other.observacao))
			return false;
		return true;
	}

}
