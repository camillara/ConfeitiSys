package com.github.camillara.confeitisys.model;

import java.time.LocalDate;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import lombok.*;

@Entity
@Table(name = "tb_cliente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@ToString
public class Cliente {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "data_de_nascimento")
	@DateTimeFormat(pattern = "dd/MM/yyyy")
	private LocalDate nascimento;

	@Column(name = "nome")
	@NotBlank(message = "O nome não pode estar em branco")
	private String nome;

	@Column(name = "endereco")
	private String endereco;

	@Pattern(
			regexp = "^$|^\\(\\d{2}\\)\\d{4}-\\d{4}$|^\\(\\d{2}\\)\\d{5}-\\d{4}$",
			message = "Formato de telefone inválido. Use (00)1234-5678 ou (00)12345-6789"
	)
	private String telefone;

	@Column(name = "email")
	@Email(message = "Por favor, forneça um endereço de e-mail válido")
	private String email;

	@Column(name = "data_de_cadastro")
	private LocalDate dataCadastro;

	@Column(name = "observacao", length = 255)
	private String observacao;

	@PrePersist
	public void prePersist() {
		setDataCadastro(LocalDate.now());
	}
}