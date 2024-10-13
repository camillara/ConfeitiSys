package com.github.camillara.confeitisys.rest.clientes;

import com.github.camillara.confeitisys.rest.clientes.dto.ClienteFormRequestDTO;
import com.github.camillara.confeitisys.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin("*")
public class ClienteController {

	@Autowired
	private ClienteService clienteService;

	@PostMapping
	public ResponseEntity<ClienteFormRequestDTO> salvar(@RequestBody ClienteFormRequestDTO request) {
		return clienteService.salvar(request);
	}

	@PutMapping("{id}")
	public ResponseEntity<Void> atualizar(@PathVariable Long id, @RequestBody ClienteFormRequestDTO request) {
		return clienteService.atualizar(id, request);
	}

	@GetMapping("{id}")
	public ResponseEntity<ClienteFormRequestDTO> getById(@PathVariable Long id) {
		return clienteService.getById(id);
	}

	@DeleteMapping("{id}")
	public ResponseEntity<Object> delete(@PathVariable Long id) {
		return clienteService.delete(id);
	}

	@GetMapping
	public Page<ClienteFormRequestDTO> getLista(
			@RequestParam(value = "nome", required = false, defaultValue = "") String nome,
			Pageable pageable) {
		return clienteService.getLista(nome, pageable);
	}
}