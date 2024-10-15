package com.github.camillara.confeitisys.rest.vendas;

import com.github.camillara.confeitisys.model.Venda;
import com.github.camillara.confeitisys.rest.produtos.dto.ItemProdutoAtualizarDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.RelatorioVendasDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.VendaDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.VendaEmProducaoDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.VendaFormRequestDTO;
import com.github.camillara.confeitisys.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vendas")
@CrossOrigin("*")
public class VendasController {

	@Autowired
	private VendaService vendaService;

	@PostMapping
	@Transactional
	public void realizarVenda(@RequestBody Venda venda, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		vendaService.realizarVenda(venda, userId);
	}

	@GetMapping("/{id}")
	public VendaDTO buscarVendaPorId(@PathVariable Long id, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		return vendaService.buscarVendaPorId(id, userId);
	}

	@PutMapping("/{id}")
	@Transactional
	public VendaDTO atualizarVenda(@PathVariable Long id, @RequestBody VendaFormRequestDTO vendaAtualizadaDTO, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		return vendaService.atualizarVenda(id, vendaAtualizadaDTO, userId);
	}

	@GetMapping("/{idVenda}/itens-produto")
	public ResponseEntity<List<ItemProdutoAtualizarDTO>> listarItensPorVenda(@PathVariable Long idVenda, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		return ResponseEntity.ok(vendaService.listarItensPorVenda(idVenda, userId));
	}

	@GetMapping
	public Page<VendaDTO> listarVendas(
			@RequestParam(value = "nomeCliente", required = false) String nomeCliente,
			@RequestParam(value = "formaPagamento", required = false) String formaPagamento,
			@RequestParam(value = "statusPagamento", required = false) String statusPagamento,
			@RequestParam(value = "statusPedido", required = false) String statusPedido,
			@RequestParam("userId") String userId, // Recebe o userId
			Pageable pageable) {

		// Passa o userId para o serviço
		return vendaService.listarVendas(nomeCliente, formaPagamento, statusPagamento, statusPedido, userId, pageable);
	}

	@DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<Void> deletarVenda(@PathVariable Long id, @RequestParam("userId") String userId) {
		// Passa o userId para o serviço
		vendaService.deletarVenda(id, userId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/em-producao")
	public ResponseEntity<List<VendaEmProducaoDTO>> listarVendasEmProducao(@RequestParam("userId") String userId) {
		List<VendaEmProducaoDTO> vendasEmProducao = vendaService.listarItensVendasEmProducao(userId);
		return ResponseEntity.ok(vendasEmProducao);
	}

	@GetMapping("/relatorio-vendas")
	public ResponseEntity<List<RelatorioVendasDTO>> gerarRelatorioPorFormaPagamentoEPeriodo(
			@RequestParam("userId") String userId,
			@RequestParam("dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
			@RequestParam("dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {

		List<RelatorioVendasDTO> relatorio = vendaService.gerarRelatorioPorFormaPagamentoEPeriodo(userId, dataInicio, dataFim);
		return ResponseEntity.ok(relatorio);
	}







}
