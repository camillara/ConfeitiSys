package com.github.camillara.confeitisys.rest.vendas;

import com.github.camillara.confeitisys.model.ItemDetalhadoVenda;
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
		// Persistir a venda
		venda.prePersist();
		repository.save(venda);

		// Processar cada item da venda
		venda.getItens().forEach(itemVenda -> {
			itemVenda.setVenda(venda);

			// Verifique diretamente se o produto está associado
			Produto produto = itemVenda.getProduto();
			if (produto == null || produto.getId() == null) {
				throw new IllegalArgumentException("Produto não pode ser nulo para o item de venda.");
			}

			// Carregar explicitamente o produto para garantir que seus itens estejam disponíveis
			produto = produtoRepository.findById(produto.getId())
					.orElseThrow(() -> new IllegalArgumentException("Produto não encontrado para o item de venda."));

			// Crie os itens detalhados da venda com base nos itensProduto
			List<ItemDetalhadoVenda> itensDetalhados = new ArrayList<>();
			if (produto.getItensProduto() != null) {
				produto.getItensProduto().forEach(insumo -> {
					if (insumo.getProduto() != null) {
						ItemDetalhadoVenda itemDetalhadoVenda = ItemDetalhadoVenda.builder()
								.itemVenda(itemVenda)
								.produto(insumo.getProduto()) // Produto insumo
								.quantidadeUsada(insumo.getQuantidade())
								.custoInsumoNoMomento(insumo.calcularValorTotal()) // Custo no momento da venda
								.build();
						itensDetalhados.add(itemDetalhadoVenda);
					} else {
						throw new IllegalStateException("Insumo não possui produto associado.");
					}
				});
			}

			// Associe os itens detalhados ao item de venda
			itemVenda.setItensDetalhados(itensDetalhados);
		});

		// Persistir os itens da venda
		itemVendaReposistory.saveAll(venda.getItens());
	}


}
