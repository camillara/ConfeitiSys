package com.github.camillara.confeitisys.service;

import com.github.camillara.confeitisys.exception.VendaNaoEncontradaException;
import com.github.camillara.confeitisys.model.*;
import com.github.camillara.confeitisys.model.repositories.*;
import com.github.camillara.confeitisys.rest.produtos.dto.ItemProdutoAtualizarDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.ItemDetalhadoVendaDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.ItemVendaDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.VendaDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.VendaFormRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendaService {

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

	@Transactional
	public void realizarVenda(Venda venda) {
		venda.prePersist();
		repository.save(venda);

		venda.getItens().forEach(itemVenda -> processarItemVenda(venda, itemVenda));
		itemVendaRepository.saveAll(venda.getItens());
	}

	private void processarItemVenda(Venda venda, ItemVenda itemVenda) {
		itemVenda.setVenda(venda);
		Produto produto = validarEObterProduto(itemVenda);
		itemVenda.setValorUnitario(produto.getPreco());
		List<ItemDetalhadoVenda> itensDetalhados = criarItensDetalhados(itemVenda, produto);
		itemVenda.setItensDetalhados(itensDetalhados);
	}

	private Produto validarEObterProduto(ItemVenda itemVenda) {
		Produto produto = itemVenda.getProduto();
		if (produto == null || produto.getId() == null) {
			throw new IllegalArgumentException("Produto não pode ser nulo para o item de venda.");
		}
		return produtoRepository.findById(produto.getId())
				.orElseThrow(() -> new IllegalArgumentException("Produto não encontrado para o item de venda."));
	}

	private List<ItemDetalhadoVenda> criarItensDetalhados(ItemVenda itemVenda, Produto produto) {
		return produto.getItensProduto().stream().map(insumo -> {
			if (insumo.getItemProduto() != null) {
				return ItemDetalhadoVenda.builder()
						.itemVenda(itemVenda)
						.produto(insumo.getItemProduto())
						.quantidadeUsada(insumo.getQuantidade())
						.custoInsumoNoMomento(insumo.getItemProduto().getPreco())
						.build();
			} else {
				throw new IllegalStateException("Insumo não possui produto associado.");
			}
		}).collect(Collectors.toList());
	}

	public VendaDTO buscarVendaPorId(Long id) {
		Venda venda = repository.findById(id)
				.orElseThrow(() -> new VendaNaoEncontradaException(id));
		return converterVendaParaDTO(venda);
	}

	public VendaDTO atualizarVenda(Long id, VendaFormRequestDTO vendaAtualizadaDTO) {
		Venda vendaExistente = repository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Venda não encontrada para o ID: " + id));

		Cliente cliente = clienteRepository.findById(vendaAtualizadaDTO.getIdCliente())
				.orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado para o ID: " + vendaAtualizadaDTO.getIdCliente()));

		vendaExistente.setCliente(cliente);
		vendaExistente.setFormaPagamento(vendaAtualizadaDTO.getFormaPagamento());
		vendaExistente.setStatusPagamento(vendaAtualizadaDTO.getStatusPagamento());
		vendaExistente.setStatusPedido(vendaAtualizadaDTO.getStatusPedido());
		vendaExistente.setDataEntrega(vendaAtualizadaDTO.getDataEntrega());
		vendaExistente.setObservacao(vendaAtualizadaDTO.getObservacao());
		vendaExistente.setTotal(vendaAtualizadaDTO.getTotal());

		List<Object[]> itensVendaExistentes = itemVendaRepository.findItemVendaIdsAndProdutoIdsByVendaId(id);
		List<Long> idsItensVendaExistentes = itensVendaExistentes.stream()
				.map(obj -> (Long) obj[0])
				.collect(Collectors.toList());

		List<ItemVenda> itensAtualizados = vendaAtualizadaDTO.getItens().stream().map(itemDTO -> {
			ItemVenda itemVenda;

			if (itemDTO.getId() == null) {
				itemVenda = new ItemVenda();
			} else {
				itemVenda = itemVendaRepository.findById(itemDTO.getId())
						.orElseThrow(() -> new IllegalArgumentException("Item de venda não encontrado para o ID: " + itemDTO.getId()));
				idsItensVendaExistentes.remove(itemDTO.getId());
			}

			Produto produto = produtoRepository.findById(itemDTO.getIdProduto())
					.orElseThrow(() -> new IllegalArgumentException("Produto não encontrado para o ID: " + itemDTO.getIdProduto()));
			itemVenda.setProduto(produto);
			itemVenda.setQuantidade(itemDTO.getQuantidade());
			itemVenda.setValorUnitario(produto.getPreco());

			List<ItemDetalhadoVenda> itensDetalhados = criarItensDetalhados(itemVenda, produto);
			itemVenda.setItensDetalhados(itensDetalhados);
			return itemVenda;
		}).collect(Collectors.toList());

		idsItensVendaExistentes.forEach(idItemVendaRemovido -> {
			List<Long> idsItensDetalhados = itemDetalhadoVendaRepository.findIdsByItemVendaId(idItemVendaRemovido);
			itemDetalhadoVendaRepository.deleteAllById(idsItensDetalhados);
			itemVendaRepository.deleteById(idItemVendaRemovido);
		});

		vendaExistente.setItens(itensAtualizados);
		repository.save(vendaExistente);

		return converterVendaParaDTO(vendaExistente);
	}

	public List<ItemProdutoAtualizarDTO> listarItensPorVenda(Long idVenda) {
		List<ItemVenda> itensVenda = itemVendaRepository.findByVendaId(idVenda);
		return itensVenda.stream().map(itemVenda -> {
			Produto produto = itemVenda.getProduto();
			return ItemProdutoAtualizarDTO.builder()
					.produtoId(produto.getId())
					.categoria(produto.getCategoria().name())
					.nome(produto.getNome())
					.tipo(produto.getTipo().name())
					.precoUnitario(itemVenda.getValorUnitario())
					.qtd(itemVenda.getQuantidade())
					.total(itemVenda.getValorUnitario().multiply(new BigDecimal(itemVenda.getQuantidade())))
					.build();
		}).collect(Collectors.toList());
	}

	public VendaDTO converterVendaParaDTO(Venda venda) {
		List<ItemVendaDTO> itensDTO = venda.getItens().stream()
				.map(item -> {
					List<ItemDetalhadoVendaDTO> itensDetalhadosDTO = item.getItensDetalhados().stream()
							.map(detalhe -> ItemDetalhadoVendaDTO.builder()
									.id(detalhe.getId())
									.idProduto(detalhe.getProduto().getId())
									.nomeProduto(detalhe.getProduto().getNome())
									.quantidade(detalhe.getQuantidadeUsada())
									.custoInsumoNoMomento(detalhe.getCustoInsumoNoMomento())
									.build())
							.collect(Collectors.toList());

					return ItemVendaDTO.builder()
							.id(item.getId())
							.idProduto(item.getProduto().getId())
							.nomeProduto(item.getProduto().getNome())
							.quantidade(item.getQuantidade())
							.preco(item.getValorUnitario())
							.itens(itensDetalhadosDTO)
							.build();
				})
				.collect(Collectors.toList());

		return VendaDTO.builder()
				.id(venda.getId())
				.cliente(venda.getCliente())
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

	public Page<VendaDTO> listarVendas(String nomeCliente, String formaPagamento, String statusPagamento,
									   String statusPedido, LocalDate dataCadastroInicio, LocalDate dataCadastroFim,
									   LocalDate dataEntregaInicio, LocalDate dataEntregaFim, Pageable pageable) {

		Page<Venda> vendas = repository.buscarPorFiltros(
				nomeCliente, formaPagamento, statusPagamento, statusPedido,
				dataCadastroInicio, dataCadastroFim, dataEntregaInicio, dataEntregaFim, pageable);

		return vendas.map(this::converterVendaParaDTO);
	}

	@Transactional
	public void deletarVenda(Long id) {
		Venda vendaExistente = repository.findById(id)
				.orElseThrow(() -> new VendaNaoEncontradaException(id));

		vendaExistente.getItens().forEach(itemVenda -> {
			List<Long> idsItensDetalhados = itemDetalhadoVendaRepository.findIdsByItemVendaId(itemVenda.getId());
			if (!idsItensDetalhados.isEmpty()) {
				itemDetalhadoVendaRepository.deleteAllById(idsItensDetalhados);
			}
			itemVendaRepository.deleteById(itemVenda.getId());
		});

		repository.deleteById(id);
	}
}
