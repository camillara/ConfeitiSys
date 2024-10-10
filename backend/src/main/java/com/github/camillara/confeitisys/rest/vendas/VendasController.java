package com.github.camillara.confeitisys.rest.vendas;

import com.github.camillara.confeitisys.model.ItemDetalhadoVenda;
import com.github.camillara.confeitisys.model.ItemVenda;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.Venda;
import com.github.camillara.confeitisys.model.repositories.ProdutoRepository;
import com.github.camillara.confeitisys.model.repositories.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.camillara.confeitisys.model.repositories.ItemVendaRepository;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/vendas")
@CrossOrigin("*")
public class VendasController {

	@Autowired
	private VendaRepository repository;

	@Autowired
	private ItemVendaRepository itemVendaReposistory;

	@Autowired
	private ProdutoRepository produtoRepository;

	@PostMapping
	@Transactional
	public void realizarVenda(@RequestBody Venda venda) {
		venda.prePersist();
		repository.save(venda);

		venda.getItens().forEach(itemVenda -> {
			processarItemVenda(venda, itemVenda);
		});

		itemVendaReposistory.saveAll(venda.getItens());
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
}