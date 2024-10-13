package com.github.camillara.confeitisys.service;

import com.github.camillara.confeitisys.exception.OperacaoNaoPermitidaException;
import com.github.camillara.confeitisys.model.ItemProduto;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.enums.Categoria;
import com.github.camillara.confeitisys.model.repositories.ProdutoRepository;
import com.github.camillara.confeitisys.rest.produtos.dto.ProdutoFormRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    public List<ProdutoFormRequestDTO> getLista() {
        return repository.findAll().stream().map(ProdutoFormRequestDTO::fromModel).collect(Collectors.toList());
    }

    public ResponseEntity<ProdutoFormRequestDTO> getById(Long id) {
        Optional<Produto> produtoExistente = repository.findById(id);

        if (produtoExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        var produto = produtoExistente.map(ProdutoFormRequestDTO::fromModel).get();
        return ResponseEntity.ok(produto);
    }

    public ProdutoFormRequestDTO salvar(ProdutoFormRequestDTO produtoDTO) {
        Produto entidadeProduto = produtoDTO.toModel();
        entidadeProduto.setItensProduto(null);
        Produto produtoSalvo = repository.save(entidadeProduto);
        salvarItensProduto(produtoDTO, produtoSalvo);
        return ProdutoFormRequestDTO.fromModel(produtoSalvo);
    }

    public ResponseEntity<Void> atualizar(Long id, ProdutoFormRequestDTO produtoDTO) {
        Optional<Produto> produtoExistenteOptional = repository.findById(id);

        if (produtoExistenteOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Produto produtoExistente = produtoExistenteOptional.get();
        verificarAlteracaoDeCategoria(produtoExistente, produtoDTO.getCategoria());

        produtoExistente.setNome(produtoDTO.getNome());
        produtoExistente.setDescricao(produtoDTO.getDescricao());
        produtoExistente.setPreco(produtoDTO.getPreco());
        produtoExistente.setCategoria(produtoDTO.getCategoria());
        produtoExistente.setTipo(produtoDTO.getTipo());

        produtoExistente.getItensProduto().clear();
        if (produtoDTO.getItensProduto() != null) {
            List<ItemProduto> novosItens = produtoDTO.getItensProduto().stream()
                    .map(dto -> dto.toModel(produtoExistente, repository))
                    .collect(Collectors.toList());
            produtoExistente.getItensProduto().addAll(novosItens);
        }

        repository.save(produtoExistente);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<Void> deletar(Long id) {
        Optional<Produto> produtoExistente = repository.findById(id);

        if (produtoExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Produto produto = produtoExistente.get();
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
            repository.save(produtoSalvo);
        }
    }

    private void verificarUsoDeMateriaPrima(Produto produto) {
        if (produto.getCategoria() == Categoria.MATERIA_PRIMA) {
            boolean estaSendoUsado = repository.isProdutoUsadoComoItem(produto.getId());

            if (estaSendoUsado) {
                throw new OperacaoNaoPermitidaException("Não é possível deletar um produto cadastrado como 'Matéria Prima' que está sendo utilizado em outros produtos.");
            }
        }
    }

    private void verificarAlteracaoDeCategoria(Produto produtoExistente, Categoria novaCategoria) {
        if (produtoExistente.getCategoria() == Categoria.MATERIA_PRIMA) {
            boolean estaSendoUsado = repository.isProdutoUsadoComoItem(produtoExistente.getId());

            if (estaSendoUsado && !produtoExistente.getCategoria().equals(novaCategoria)) {
                throw new OperacaoNaoPermitidaException("Não é permitido alterar a categoria de um produto cadastrado como 'Matéria Prima' que está sendo utilizado em outros produtos.");
            }
        }
    }

    public ResponseEntity<List<ProdutoFormRequestDTO>> getProdutosByItemProdutoId(Long itemProdutoId) {
        List<Produto> produtos = repository.findProdutosByItemProdutoId(itemProdutoId);

        if (produtos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<ProdutoFormRequestDTO> produtoDTOs = produtos.stream()
                .map(ProdutoFormRequestDTO::fromModel)
                .collect(Collectors.toList());

        return ResponseEntity.ok(produtoDTOs);
    }

    public Page<ProdutoFormRequestDTO> getLista(String nome, String categoria, Pageable pageable) {
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
        boolean produtoVinculadoEmVenda = repository.existsProdutoVinculadoEmItemVenda(produto.getId()) ||
                repository.existsProdutoVinculadoEmItemDetalhadoVenda(produto.getId());

        if (produtoVinculadoEmVenda) {
            throw new OperacaoNaoPermitidaException("Não é possível excluir o produto pois ele está vinculado a uma venda.");
        }
    }
}