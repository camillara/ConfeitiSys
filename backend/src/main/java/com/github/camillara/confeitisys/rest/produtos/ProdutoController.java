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
	public List<ProdutoFormRequestDTO> getLista() {
		return produtoService.getLista();
	}

	@GetMapping("{id}")
	public ResponseEntity<ProdutoFormRequestDTO> getById(@PathVariable Long id) {
		return produtoService.getById(id);
	}

	@PostMapping
	public ProdutoFormRequestDTO salvar(@RequestBody ProdutoFormRequestDTO produtoDTO) {
		return produtoService.salvar(produtoDTO);
	}

	@PutMapping("{id}")
	public ResponseEntity<Void> atualizar(@PathVariable Long id, @RequestBody ProdutoFormRequestDTO produtoDTO) {
		return produtoService.atualizar(id, produtoDTO);
	}

	@DeleteMapping("{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id) {
		return produtoService.deletar(id);
	}

	@GetMapping("/por-item/{itemProdutoId}")
	public ResponseEntity<List<ProdutoFormRequestDTO>> getProdutosByItemProdutoId(@PathVariable Long itemProdutoId) {
		return produtoService.getProdutosByItemProdutoId(itemProdutoId);
	}

	@GetMapping("/filtrar")
	public Page<ProdutoFormRequestDTO> getLista(
			@RequestParam(value = "nome", required = false, defaultValue = "") String nome,
			@RequestParam(value = "categoria", required = false) String categoria,
			Pageable pageable) {
		return produtoService.getLista(nome, categoria, pageable);
	}
}