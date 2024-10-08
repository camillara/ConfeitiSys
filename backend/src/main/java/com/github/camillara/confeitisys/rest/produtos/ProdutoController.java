package com.github.camillara.confeitisys.rest.produtos;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.github.camillara.confeitisys.exception.OperacaoNaoPermitidaException;
import com.github.camillara.confeitisys.model.ItemProduto;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.enums.Categoria;
import com.github.camillara.confeitisys.rest.produtos.dto.ProdutoFormRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.camillara.confeitisys.model.repositories.ProdutoRepository;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin("*")
public class ProdutoController {

	@Autowired
	private ProdutoRepository repository;

	@GetMapping
	public List<ProdutoFormRequestDTO> getLista() {
		return repository.findAll().stream().map(ProdutoFormRequestDTO::fromModel).collect(Collectors.toList());
	}

	@GetMapping("{id}")
	public ResponseEntity<ProdutoFormRequestDTO> getById(@PathVariable Long id) {
		Optional<Produto> produtoExistente = repository.findById(id);

		if (produtoExistente.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		var produto = produtoExistente.map(ProdutoFormRequestDTO::fromModel).get();
		return ResponseEntity.ok(produto);
	}

	@PostMapping
	public ProdutoFormRequestDTO salvar(@RequestBody ProdutoFormRequestDTO produtoDTO) {
		// Primeiro, salvar o produto sem os itensProduto
		Produto entidadeProduto = produtoDTO.toModel();
		entidadeProduto.setItensProduto(null); // Evitar salvar itensProduto neste momento
		Produto produtoSalvo = repository.save(entidadeProduto);

		// Salvar os itensProduto
		salvarItensProduto(produtoDTO, produtoSalvo);

		return ProdutoFormRequestDTO.fromModel(produtoSalvo);
	}

	@PutMapping("{id}")
	public ResponseEntity<Void> atualizar(@PathVariable Long id, @RequestBody ProdutoFormRequestDTO produtoDTO) {
		Optional<Produto> produtoExistenteOptional = repository.findById(id);

		if (produtoExistenteOptional.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		Produto produtoExistente = produtoExistenteOptional.get();

		// Verificar se o produto é do tipo "MATERIA_PRIMA" e está sendo usado em outro produto
		verificarUsoDeMateriaPrima(produtoExistente);

		// Atualizar os dados do produto
		produtoExistente.setNome(produtoDTO.getNome());
		produtoExistente.setDescricao(produtoDTO.getDescricao());
		produtoExistente.setPreco(produtoDTO.getPreco());
		produtoExistente.setCategoria(produtoDTO.getCategoria());
		produtoExistente.setTipo(produtoDTO.getTipo());

		// Atualizar os itensProduto
		produtoExistente.getItensProduto().clear(); // Limpar itens antigos
		if (produtoDTO.getItensProduto() != null) {
			List<ItemProduto> novosItens = produtoDTO.getItensProduto().stream()
					.map(dto -> dto.toModel(produtoExistente, repository))
					.collect(Collectors.toList());
			produtoExistente.getItensProduto().addAll(novosItens);
		}

		// Salvar a entidade atualizada
		repository.save(produtoExistente);

		return ResponseEntity.ok().build();
	}



	@DeleteMapping("{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id) {
		Optional<Produto> produtoExistente = repository.findById(id);

		if (produtoExistente.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		Produto produto = produtoExistente.get();

		// Verificar se o produto é do tipo "MATERIA_PRIMA" e está sendo usado em outro produto
		verificarUsoDeMateriaPrima(produto);

		repository.delete(produto);
		return ResponseEntity.noContent().build();
	}

	private void salvarItensProduto(ProdutoFormRequestDTO produtoDTO, Produto produtoSalvo) {
		if (produtoDTO.getItensProduto() != null) {
			List<ItemProduto> itensProduto = produtoDTO.getItensProduto().stream()
					.map(dto -> dto.toModel(produtoSalvo, repository))
					.collect(Collectors.toList());
			produtoSalvo.setItensProduto(itensProduto);
			repository.save(produtoSalvo); // Salvar novamente o produto com os itensProduto
		}
	}

	// Método para verificar se um produto do tipo "MATERIA_PRIMA" está sendo usado como item em outro produto
	private void verificarUsoDeMateriaPrima(Produto produto) {
		// Comparar diretamente com o enum Categoria.MATERIA_PRIMA
		if (produto.getCategoria() == Categoria.MATERIA_PRIMA) {
			// Consultar se o produto está sendo usado como item em outros produtos
			boolean estaSendoUsado = repository.isProdutoUsadoComoItem(produto.getId());

			if (estaSendoUsado) {
				throw new OperacaoNaoPermitidaException("Não é possível alterar ou deletar um produto do tipo 'Matéria Prima' que está sendo utilizado em outros produtos.");
			}
		}
	}



}