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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

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
		verificarAlteracaoDeCategoria(produtoExistente, produtoDTO.getCategoria());

		// Atualizar os dados do produto
		produtoExistente.setNome(produtoDTO.getNome());
		produtoExistente.setDescricao(produtoDTO.getDescricao());
		produtoExistente.setPreco(produtoDTO.getPreco());
		produtoExistente.setCategoria(produtoDTO.getCategoria());  // Categoria será validada na função
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

		// Verificar se o produto está vinculado a uma venda
		verificarProdutoVinculadoAVenda(produto);

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
				throw new OperacaoNaoPermitidaException("Não é possível deletar um produto cadastrado como 'Matéria Prima' que está sendo utilizado em outros produtos.");
			}
		}
	}

	private void verificarAlteracaoDeCategoria(Produto produtoExistente, Categoria novaCategoria) {
		// Verificar se o produto é MATERIA_PRIMA e está sendo usado em outros produtos
		if (produtoExistente.getCategoria() == Categoria.MATERIA_PRIMA) {
			boolean estaSendoUsado = repository.isProdutoUsadoComoItem(produtoExistente.getId());

			// Se o produto está sendo usado e houve tentativa de mudança de categoria, lançar exceção
			if (estaSendoUsado && !produtoExistente.getCategoria().equals(novaCategoria)) {
				throw new OperacaoNaoPermitidaException("Não é permitido alterar a categoria de um produto cadastrado como 'Matéria Prima' que está sendo utilizado em outros produtos.");
			}
		}
	}


	// Endpoint para listar produtos que utilizam determinado itemProduto
	@GetMapping("/por-item/{itemProdutoId}")
	public ResponseEntity<List<ProdutoFormRequestDTO>> getProdutosByItemProdutoId(@PathVariable Long itemProdutoId) {
		List<Produto> produtos = repository.findProdutosByItemProdutoId(itemProdutoId);

		if (produtos.isEmpty()) {
			return ResponseEntity.noContent().build(); // Retorna 204 No Content se não houver produtos
		}

		// Converte os produtos para DTO e retorna no ResponseEntity
		List<ProdutoFormRequestDTO> produtoDTOs = produtos.stream()
				.map(ProdutoFormRequestDTO::fromModel)
				.collect(Collectors.toList());

		return ResponseEntity.ok(produtoDTOs);
	}

	@GetMapping("/filtrar")
	public Page<ProdutoFormRequestDTO> getLista(
			@RequestParam(value = "nome", required = false, defaultValue = "") String nome,
			@RequestParam(value = "categoria", required = false) String categoria,
			Pageable pageable) {

		Categoria categoriaEnum = null;

		if (categoria != null && !categoria.isEmpty()) {
			try {
				categoriaEnum = Categoria.valueOf(categoria.toUpperCase());
			} catch (IllegalArgumentException e) {
				// Categoria inválida, log ou lance exceção se necessário
			}
		}

		return repository.buscarPorNomeECategoria("%" + nome + "%", categoriaEnum, pageable)
				.map(ProdutoFormRequestDTO::fromModel);
	}

	private void verificarProdutoVinculadoAVenda(Produto produto) {
		// Verificar se o produto está vinculado a alguma venda
		boolean produtoVinculadoEmVenda = repository.existsProdutoVinculadoEmItemVenda(produto.getId()) ||
				repository.existsProdutoVinculadoEmItemDetalhadoVenda(produto.getId());

		if (produtoVinculadoEmVenda) {
			throw new OperacaoNaoPermitidaException("Não é possível excluir o produto pois ele está vinculado a uma venda.");
		}
	}





}