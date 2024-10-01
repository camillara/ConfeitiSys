package com.github.camillara.confeitisys.rest.clientes.dto;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.github.camillara.confeitisys.model.Cliente;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteFormRequestDTO {

	private Long id;
	private String nome;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate dataNascimento;

	private String endereco;
	private String email;
	private String telefone;

	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate cadastro;

	private String observacao;

	public Cliente toModel() {
		return Cliente.builder()
				.id(id)
				.nascimento(dataNascimento)
				.nome(nome)
				.endereco(endereco)
				.telefone(telefone)
				.email(email)
				.dataCadastro(cadastro)
				.observacao(observacao)
				.build();
	}

	public static ClienteFormRequestDTO fromModel(Cliente cliente) {
		return ClienteFormRequestDTO.builder()
				.id(cliente.getId())
				.nome(cliente.getNome())
				.dataNascimento(cliente.getNascimento())
				.endereco(cliente.getEndereco())
				.email(cliente.getEmail())
				.telefone(cliente.getTelefone())
				.cadastro(cliente.getDataCadastro())
				.observacao(cliente.getObservacao())
				.build();
	}
}