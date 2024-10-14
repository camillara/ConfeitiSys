package com.github.camillara.confeitisys.service;

import com.github.camillara.confeitisys.exception.OperacaoNaoPermitidaException;
import com.github.camillara.confeitisys.model.ItemProduto;
import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.User;
import com.github.camillara.confeitisys.model.enums.Categoria;
import com.github.camillara.confeitisys.model.repositories.ProdutoRepository;
import com.github.camillara.confeitisys.model.repositories.UserRepository;
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

    @Autowired
    private UserRepository userRepository; // Para buscar o usuário pelo ID

    // Método para converter a String userId para Long
    private Long convertStringToLong(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (NumberFormatException e) {
            throw new OperacaoNaoPermitidaException("ID de usuário inválido.");
        }
    }

    public List<ProdutoFormRequestDTO> getLista(String userId) {
        Long userLongId = convertStringToLong(userId); // Converte o userId para Long
        Optional<User> user = userRepository.findById(userLongId); // Verifica se o userId é válido
        if (user.isEmpty()) {
            throw new OperacaoNaoPermitidaException("Usuário não encontrado.");
        }
        // Busca os produtos pertencentes ao usuário logado
        return repository.findByUserId(userLongId)
                .stream()
                .map(ProdutoFormRequestDTO::fromModel)
                .collect(Collectors.toList());
    }


    public ResponseEntity<ProdutoFormRequestDTO> getById(Long id, String userId) {
        Long userLongId = convertStringToLong(userId);
        Optional<User> user = userRepository.findById(userLongId);
        if (user.isEmpty()) {
            throw new OperacaoNaoPermitidaException("Usuário não encontrado.");
        }

        Optional<Produto> produtoExistente = repository.findById(id);
        if (produtoExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        var produto = produtoExistente.map(ProdutoFormRequestDTO::fromModel).get();
        return ResponseEntity.ok(produto);
    }

    public ProdutoFormRequestDTO salvar(ProdutoFormRequestDTO produtoDTO, String userId) {
        Long userLongId = convertStringToLong(userId);
        Optional<User> user = userRepository.findById(userLongId);
        if (user.isEmpty()) {
            throw new OperacaoNaoPermitidaException("Usuário não encontrado.");
        }

        Produto entidadeProduto = produtoDTO.toModel();
        entidadeProduto.setItensProduto(null);
        entidadeProduto.setUser(user.get());
        Produto produtoSalvo = repository.save(entidadeProduto);
        salvarItensProduto(produtoDTO, produtoSalvo);
        return ProdutoFormRequestDTO.fromModel(produtoSalvo);
    }


    public ResponseEntity<Void> atualizar(Long id, ProdutoFormRequestDTO produtoDTO, String userId) {
        Long userLongId = convertStringToLong(userId);
        Optional<User> user = userRepository.findById(userLongId);
        if (user.isEmpty()) {
            throw new OperacaoNaoPermitidaException("Usuário não encontrado.");
        }

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

        produtoExistente.setUser(user.get()); // Define o usuário ao atualizar
        repository.save(produtoExistente);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<Void> deletar(Long id, String userId) {
        Long userLongId = convertStringToLong(userId);
        Optional<User> user = userRepository.findById(userLongId);
        if (user.isEmpty()) {
            throw new OperacaoNaoPermitidaException("Usuário não encontrado.");
        }

        Optional<Produto> produtoExistente = repository.findById(id);
        if (produtoExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Produto produto = produtoExistente.get();

        // Verifica se o produto é matéria-prima e está sendo utilizado
        verificarUsoDeMateriaPrima(produto);

        // Verifica se o produto está vinculado a uma venda
        verificarProdutoVinculadoAVenda(produto);

        repository.delete(produto); // Agora pode deletar o produto se todas as verificações passarem
        return ResponseEntity.noContent().build();
    }


    public Page<ProdutoFormRequestDTO> getLista(String nome, String categoria, String userId, Pageable pageable) {
        Long userLongId = convertStringToLong(userId);
        Optional<User> user = userRepository.findById(userLongId);
        if (user.isEmpty()) {
            throw new OperacaoNaoPermitidaException("Usuário não encontrado.");
        }

        Categoria categoriaEnum = null;
        if (categoria != null && !categoria.isEmpty()) {
            try {
                categoriaEnum = Categoria.valueOf(categoria.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Categoria inválida, log ou lance exceção se necessário
            }
        }

        return repository.buscarPorNomeECategoriaEUser("%" + nome + "%", categoriaEnum, userLongId, pageable)
                .map(ProdutoFormRequestDTO::fromModel);
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



    private void verificarProdutoVinculadoAVenda(Produto produto) {
        boolean produtoVinculadoEmVenda = repository.existsProdutoVinculadoEmItemVenda(produto.getId()) ||
                repository.existsProdutoVinculadoEmItemDetalhadoVenda(produto.getId());

        if (produtoVinculadoEmVenda) {
            throw new OperacaoNaoPermitidaException("Não é possível excluir o produto pois ele está vinculado a uma venda.");
        }
    }
}