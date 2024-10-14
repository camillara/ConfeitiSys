package com.github.camillara.confeitisys.rest.produtos;

import com.github.camillara.confeitisys.rest.produtos.dto.ProdutoFormRequestDTO;
import com.github.camillara.confeitisys.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin("*")
public class ProdutoController {

	@Autowired
	private ProdutoService produtoService;

	@GetMapping
	public List<ProdutoFormRequestDTO> getLista(@RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		return produtoService.getLista(userId);
	}

	@GetMapping("{id}")
	public ResponseEntity<ProdutoFormRequestDTO> getById(@PathVariable Long id, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		return produtoService.getById(id, userId);
	}

	@PostMapping
	public ProdutoFormRequestDTO salvar(@RequestBody ProdutoFormRequestDTO produtoDTO, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		return produtoService.salvar(produtoDTO, userId);
	}

	@PutMapping("{id}")
	public ResponseEntity<Void> atualizar(@PathVariable Long id, @RequestBody ProdutoFormRequestDTO produtoDTO, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		return produtoService.atualizar(id, produtoDTO, userId);
	}

	@DeleteMapping("{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		return produtoService.deletar(id, userId);
	}

	@GetMapping("/por-item/{itemProdutoId}")
	public ResponseEntity<List<ProdutoFormRequestDTO>> getProdutosByItemProdutoId(@PathVariable Long itemProdutoId) {
		return produtoService.getProdutosByItemProdutoId(itemProdutoId);
	}

	@GetMapping("/filtrar")
	public Page<ProdutoFormRequestDTO> getLista(
			@RequestParam(value = "nome", required = false, defaultValue = "") String nome,
			@RequestParam(value = "categoria", required = false) String categoria,
			@RequestParam("userId") String userId,
			Pageable pageable) {
		// Passa o userId para o serviço
		return produtoService.getLista(nome, categoria, userId, pageable);
	}
}
