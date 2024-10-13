package com.github.camillara.confeitisys.rest.vendas;

import com.github.camillara.confeitisys.exception.VendaNaoEncontradaException;
import com.github.camillara.confeitisys.model.*;
import com.github.camillara.confeitisys.model.repositories.*;
import com.github.camillara.confeitisys.rest.produtos.dto.ItemProdutoAtualizarDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vendas")
@CrossOrigin("*")
public class VendasController {

	@Autowired
	private VendaRepository repository;

	@Autowired
	private ItemVendaRepository itemVendaRepository;

	@Autowired
	private ItemDetalhadoVendaRepository itemDetalhadoVendaRepository;

	@Autowired
	private ProdutoRepository produtoRepository;

	@Autowired
	private ClienteRepository clienteRepository;

	// Método para realizar uma nova venda
	@PostMapping
	@Transactional
	public void realizarVenda(@RequestBody Venda venda) {
		venda.prePersist();
		repository.save(venda);

		venda.getItens().forEach(itemVenda -> {
			processarItemVenda(venda, itemVenda);
		});

		itemVendaRepository.saveAll(venda.getItens());
	}

	// Método auxiliar para processar itens de venda
	private void processarItemVenda(Venda venda, ItemVenda itemVenda) {
		itemVenda.setVenda(venda);
		Produto produto = validarEObterProduto(itemVenda);
		itemVenda.setValorUnitario(produto.getPreco());
		List<ItemDetalhadoVenda> itensDetalhados = criarItensDetalhados(itemVenda, produto);
		itemVenda.setItensDetalhados(itensDetalhados);
	}

	// Método auxiliar para validar e obter um produto
	private Produto validarEObterProduto(ItemVenda itemVenda) {
		Produto produto = itemVenda.getProduto();
		if (produto == null || produto.getId() == null) {
			throw new IllegalArgumentException("Produto não pode ser nulo para o item de venda.");
		}
		return produtoRepository.findById(produto.getId())
				.orElseThrow(() -> new IllegalArgumentException("Produto não encontrado para o item de venda."));
	}

	// Método auxiliar para criar itens detalhados de venda
	private List<ItemDetalhadoVenda> criarItensDetalhados(ItemVenda itemVenda, Produto produto) {
		List<ItemDetalhadoVenda> itensDetalhados = new ArrayList<>();
		if (produto.getItensProduto() != null) {
			produto.getItensProduto().forEach(insumo -> {
				if (insumo.getItemProduto() != null) {
					ItemDetalhadoVenda itemDetalhadoVenda = ItemDetalhadoVenda.builder()
							.itemVenda(itemVenda)
							.produto(insumo.getItemProduto())
							.quantidadeUsada(insumo.getQuantidade())
							.custoInsumoNoMomento(insumo.getItemProduto().getPreco())
							.build();
					itensDetalhados.add(itemDetalhadoVenda);
				} else {
					throw new IllegalStateException("Insumo não possui produto associado.");
				}
			});
		}
		return itensDetalhados;
	}

	// Método para buscar uma venda pelo ID
	@GetMapping("/{id}")
	public VendaDTO buscarVendaPorId(@PathVariable Long id) {
		Venda venda = repository.findById(id)
				.orElseThrow(() -> new VendaNaoEncontradaException(id));

		return converterVendaParaDTO(venda);
	}

	// Método para converter a entidade Venda para DTO
	// Método para converter a entidade Venda para DTO
	private VendaDTO converterVendaParaDTO(Venda venda) {
		List<ItemVendaDTO> itensDTO = venda.getItens().stream()
				.map(item -> {
					List<ItemDetalhadoVendaDTO> itensDetalhadosDTO = item.getItensDetalhados().stream()
							.map(detalhe -> ItemDetalhadoVendaDTO.builder()
									.id(detalhe.getId())
									.idProduto(detalhe.getProduto().getId())
									.nomeProduto(detalhe.getProduto().getNome()) // Nome do produto
									.quantidade(detalhe.getQuantidadeUsada())
									.custoInsumoNoMomento(detalhe.getCustoInsumoNoMomento()) // Custo do insumo
									.build())
							.collect(Collectors.toList());

					return ItemVendaDTO.builder()
							.id(item.getId())
							.idProduto(item.getProduto().getId())
							.nomeProduto(item.getProduto().getNome()) // Nome do produto
							.quantidade(item.getQuantidade())
							.preco(item.getValorUnitario()) // Preço unitário
							.itens(itensDetalhadosDTO) // Itens detalhados
							.build();
				})
				.collect(Collectors.toList());

		return VendaDTO.builder()
				.id(venda.getId())
				.cliente(venda.getCliente()) // Incluindo o objeto Cliente completo
				.formaPagamento(venda.getFormaPagamento())
				.statusPagamento(venda.getStatusPagamento())
				.statusPedido(venda.getStatusPedido())
				.itens(itensDTO)
				.total(venda.getTotal())
				.cadastro(venda.getDataCadastro())
				.dataEntrega(venda.getDataEntrega())
				.observacao(venda.getObservacao())
				.build();
	}

	@PutMapping("/{id}")
	@Transactional
	public VendaDTO atualizarVenda(@PathVariable Long id, @RequestBody VendaFormRequestDTO vendaAtualizadaDTO) {
		// Busca a venda existente
		Venda vendaExistente = repository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Venda não encontrada para o ID: " + id));

		// Atualiza os campos da venda
		Cliente cliente = clienteRepository.findById(vendaAtualizadaDTO.getIdCliente())
				.orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado para o ID: " + vendaAtualizadaDTO.getIdCliente()));

		vendaExistente.setCliente(cliente);
		vendaExistente.setFormaPagamento(vendaAtualizadaDTO.getFormaPagamento());
		vendaExistente.setStatusPagamento(vendaAtualizadaDTO.getStatusPagamento());
		vendaExistente.setStatusPedido(vendaAtualizadaDTO.getStatusPedido());
		vendaExistente.setDataEntrega(vendaAtualizadaDTO.getDataEntrega());
		vendaExistente.setObservacao(vendaAtualizadaDTO.getObservacao());
		vendaExistente.setTotal(vendaAtualizadaDTO.getTotal());

		// Buscar todos os ids dos ItemVenda relacionados à venda
		List<Object[]> itensVendaExistentes = itemVendaRepository.findItemVendaIdsAndProdutoIdsByVendaId(id);

		// Criar uma lista para armazenar os ids de itens de venda a serem removidos
		List<Long> idsItensVendaExistentes = itensVendaExistentes.stream()
				.map(obj -> (Long) obj[0]) // O primeiro elemento do Object[] é o id de ItemVenda
				.collect(Collectors.toList());

		// Iterar sobre os novos itens de venda e atualizar ou adicionar os novos
		List<ItemVenda> itensAtualizados = vendaAtualizadaDTO.getItens().stream().map(itemDTO -> {
			ItemVenda itemVenda;

			// Se o ID do item de venda é nulo, é um novo item de venda
			if (itemDTO.getId() == null) {
				itemVenda = new ItemVenda();
			} else {
				// Caso contrário, tenta buscar o item existente
				itemVenda = itemVendaRepository.findById(itemDTO.getId())
						.orElseThrow(() -> new IllegalArgumentException("Item de venda não encontrado para o ID: " + itemDTO.getId()));

				// Remover da lista de ids a serem excluídos
				idsItensVendaExistentes.remove(itemDTO.getId());
			}

			itemVenda.setVenda(vendaExistente);
			Produto produto = produtoRepository.findById(itemDTO.getIdProduto())
					.orElseThrow(() -> new IllegalArgumentException("Produto não encontrado para o ID: " + itemDTO.getIdProduto()));
			itemVenda.setProduto(produto);
			itemVenda.setQuantidade(itemDTO.getQuantidade());
			itemVenda.setValorUnitario(produto.getPreco());

			// Atualizar ou adicionar os itens detalhados
			List<ItemDetalhadoVenda> itensDetalhados = produto.getItensProduto().stream().map(insumo -> {
				ItemDetalhadoVenda itemDetalhado = new ItemDetalhadoVenda();
				itemDetalhado.setItemVenda(itemVenda);
				itemDetalhado.setProduto(insumo.getItemProduto());
				itemDetalhado.setQuantidadeUsada(insumo.getQuantidade());
				itemDetalhado.setCustoInsumoNoMomento(insumo.getItemProduto().getPreco());
				return itemDetalhado;
			}).collect(Collectors.toList());

			itemVenda.setItensDetalhados(itensDetalhados);
			return itemVenda;
		}).collect(Collectors.toList());

		// Remover os itens de venda que não estão mais presentes
		for (Long idItemVendaRemovido : idsItensVendaExistentes) {
			// Buscar os itens detalhados do item de venda removido e deletar
			List<Long> idsItensDetalhados = itemDetalhadoVendaRepository.findIdsByItemVendaId(idItemVendaRemovido);
			itemDetalhadoVendaRepository.deleteAllById(idsItensDetalhados);

			// Deletar o item de venda
			itemVendaRepository.deleteById(idItemVendaRemovido);
		}

		// Atualiza os itens na venda existente
		vendaExistente.setItens(itensAtualizados);

		// Salva a venda atualizada
		repository.save(vendaExistente);

		// Retorna o DTO atualizado
		return converterVendaParaDTO(vendaExistente);
	}



	@GetMapping("/{itemVendaId}/detalhes")
	public List<Long> listarItensDetalhadosPorItemVenda(@PathVariable Long itemVendaId) {
		return itemDetalhadoVendaRepository.findIdsByItemVendaId(itemVendaId);
	}

	// Método GET para buscar itens de venda por id_venda
	@GetMapping("/itens/{idVenda}")
	public ResponseEntity<List<Object[]>> getItemVendasByVendaId(@PathVariable Long idVenda) {
		// Chama o método do repositório para buscar os itens da venda
		List<Object[]> itensVenda = itemVendaRepository.findItemVendaIdsAndProdutoIdsByVendaId(idVenda);

		// Verifica se a lista está vazia ou não
		if (itensVenda.isEmpty()) {
			return ResponseEntity.noContent().build();  // Retorna 204 No Content se não houver itens
		}

		// Retorna a lista de ids de ItemVenda e Produto
		return ResponseEntity.ok(itensVenda);
	}

	@DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<Void> deletarVenda(@PathVariable Long id) {
		Venda vendaExistente = repository.findById(id)
				.orElseThrow(() -> new VendaNaoEncontradaException(id));

		// Remover itens relacionados à venda
		vendaExistente.getItens().forEach(itemVenda -> {
			List<Long> idsItensDetalhados = itemDetalhadoVendaRepository.findIdsByItemVendaId(itemVenda.getId());
			if (!idsItensDetalhados.isEmpty()) {
				itemDetalhadoVendaRepository.deleteAllById(idsItensDetalhados);
			}
			itemVendaRepository.deleteById(itemVenda.getId());
		});

		// Deletar a venda
		repository.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping
	public Page<VendaDTO> listarVendas(
			@RequestParam(value = "nomeCliente", required = false) String nomeCliente,
			@RequestParam(value = "formaPagamento", required = false) String formaPagamento,
			@RequestParam(value = "statusPagamento", required = false) String statusPagamento,
			@RequestParam(value = "statusPedido", required = false) String statusPedido,
			@RequestParam(value = "dataCadastroInicio", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataCadastroInicio,
			@RequestParam(value = "dataCadastroFim", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataCadastroFim,
			@RequestParam(value = "dataEntregaInicio", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEntregaInicio,
			@RequestParam(value = "dataEntregaFim", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEntregaFim,
			Pageable pageable) {

		// Chamando o repositório com os parâmetros fornecidos
		Page<Venda> vendas = repository.buscarPorFiltros(
				nomeCliente,
				formaPagamento,
				statusPagamento,
				statusPedido,
				dataCadastroInicio,
				dataCadastroFim,
				dataEntregaInicio,
				dataEntregaFim,
				pageable);

		// Converte a entidade Venda em DTO para retornar na resposta
		return vendas.map(this::converterVendaParaDTO);
	}

	@GetMapping("/{idVenda}/itens-produto")
	public ResponseEntity<List<ItemProdutoAtualizarDTO>> listarItensPorVenda(@PathVariable Long idVenda) {
		List<ItemProdutoAtualizarDTO> itens = listarItensPorVendaService(idVenda);
		return ResponseEntity.ok(itens);
	}

	public List<ItemProdutoAtualizarDTO> listarItensPorVendaService(Long idVenda) {
		// Busca todos os itens de venda relacionados à venda
		List<ItemVenda> itensVenda = itemVendaRepository.findByVendaId(idVenda);

		// Mapeia os itens de venda para o DTO ItemProdutoAtualizarDTO
		return itensVenda.stream().map(itemVenda -> {
			Produto produto = itemVenda.getProduto();

			// Cria o DTO com as informações do Produto e ItemVenda
			return ItemProdutoAtualizarDTO.builder()
					.produtoId(produto.getId())
					.categoria(produto.getCategoria().name()) // Considerando que categoria e tipo são enums
					.nome(produto.getNome())
					.tipo(produto.getTipo().name())
					.precoUnitario(itemVenda.getValorUnitario())
					.qtd(itemVenda.getQuantidade())
					.total(itemVenda.getValorUnitario().multiply(new BigDecimal(itemVenda.getQuantidade()))) // Total = preço * quantidade
					.build();
		}).collect(Collectors.toList()); // Retorna a lista de DTOs
	}


}

