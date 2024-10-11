package com.github.camillara.confeitisys.rest.clientes;

import java.util.Optional;

import com.github.camillara.confeitisys.exception.OperacaoNaoPermitidaException;
import com.github.camillara.confeitisys.model.Cliente;
import com.github.camillara.confeitisys.model.repositories.ClienteRepository;
import com.github.camillara.confeitisys.rest.clientes.dto.ClienteFormRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin("*")
public class ClienteController {

	@Autowired
	private ClienteRepository repository;

	@PostMapping
	public ResponseEntity<ClienteFormRequestDTO> salvar(@RequestBody ClienteFormRequestDTO request) {
		Cliente cliente = request.toModel();
		repository.save(cliente);
		return ResponseEntity.ok(ClienteFormRequestDTO.fromModel(cliente));
	}

	@PutMapping("{id}")
	public ResponseEntity<Void> atualizar(@PathVariable Long id, @RequestBody ClienteFormRequestDTO request) {

		Optional<Cliente> clienteExistente = repository.findById(id);
		if (clienteExistente.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		Cliente cliente = request.toModel();
		cliente.setId(id);
		repository.save(cliente);
		return ResponseEntity.noContent().build();
	} 

	@GetMapping("{id}")
	public ResponseEntity<ClienteFormRequestDTO> getById(@PathVariable Long id) {
		return repository.findById(id).map(ClienteFormRequestDTO::fromModel)
				.map(clienteFR -> ResponseEntity.ok(clienteFR)).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("{id}")
	public ResponseEntity<Object> delete(@PathVariable Long id) {
		return repository.findById(id).map(cliente -> {
			// Verificar se o cliente está vinculado a uma venda
			verificarClienteVinculadoAVenda(cliente);

			// Se não estiver vinculado a nenhuma venda, permitir exclusão
			repository.delete(cliente);
			return ResponseEntity.noContent().build();
		}).orElseGet(() -> ResponseEntity.notFound().build());
	}


	@GetMapping
	public Page<ClienteFormRequestDTO> getLista(
			@RequestParam(value = "nome", required = false, defaultValue = "") String nome,
			Pageable pageable) {
		return repository.buscarPorNome("%" + nome + "%", pageable)
				.map(ClienteFormRequestDTO::fromModel);
	}

	private void verificarClienteVinculadoAVenda(Cliente cliente) {
		// Consultar se o cliente está vinculado a alguma venda
		boolean clienteVinculado = repository.existsClienteVinculadoEmVenda(cliente.getId());

		if (clienteVinculado) {
			throw new OperacaoNaoPermitidaException("Não é possível excluir o cliente, pois ele está vinculado a uma venda.");
		}
	}

}
