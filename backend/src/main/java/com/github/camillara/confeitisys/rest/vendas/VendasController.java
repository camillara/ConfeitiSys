package com.github.camillara.confeitisys.rest.vendas;

import com.github.camillara.confeitisys.model.ItemDetalhadoVenda;
import com.github.camillara.confeitisys.model.ItemVenda;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.Venda;
import com.github.camillara.confeitisys.model.repositories.ProdutoRepository;
import com.github.camillara.confeitisys.model.repositories.VendaRepository;
import com.github.camillara.confeitisys.rest.vendas.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.github.camillara.confeitisys.model.repositories.ItemVendaRepository;

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
	private ProdutoRepository produtoRepository;

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
				.orElseThrow(() -> new IllegalArgumentException("Venda não encontrada para o ID: " + id));

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
							.valorUnitario(item.getValorUnitario()) // Preço unitário
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

}
