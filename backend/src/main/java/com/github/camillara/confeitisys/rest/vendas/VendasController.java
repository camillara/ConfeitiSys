package com.github.camillara.confeitisys.rest.vendas;

import com.github.camillara.confeitisys.model.Venda;
import com.github.camillara.confeitisys.rest.produtos.dto.ItemProdutoAtualizarDTO;
import com.github.camillara.confeitisys.rest.vendas.dto.VendaDTO;
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
	public void realizarVenda(@RequestBody Venda venda) {
		vendaService.realizarVenda(venda);
	}

	@GetMapping("/{id}")
	public VendaDTO buscarVendaPorId(@PathVariable Long id) {
		return vendaService.buscarVendaPorId(id);
	}

	@PutMapping("/{id}")
	@Transactional
	public VendaDTO atualizarVenda(@PathVariable Long id, @RequestBody VendaFormRequestDTO vendaAtualizadaDTO) {
		return vendaService.atualizarVenda(id, vendaAtualizadaDTO);
	}

	@GetMapping("/{idVenda}/itens-produto")
	public ResponseEntity<List<ItemProdutoAtualizarDTO>> listarItensPorVenda(@PathVariable Long idVenda) {
		return ResponseEntity.ok(vendaService.listarItensPorVenda(idVenda));
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

		return vendaService.listarVendas(nomeCliente, formaPagamento, statusPagamento, statusPedido,
				dataCadastroInicio, dataCadastroFim, dataEntregaInicio, dataEntregaFim, pageable);
	}

	@DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<Void> deletarVenda(@PathVariable Long id) {
		vendaService.deletarVenda(id);
		return ResponseEntity.noContent().build();
	}
}
