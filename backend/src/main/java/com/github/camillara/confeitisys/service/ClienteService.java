package com.github.camillara.confeitisys.service;

import com.github.camillara.confeitisys.exception.OperacaoNaoPermitidaException;
import com.github.camillara.confeitisys.model.Cliente;
import com.github.camillara.confeitisys.model.User;
import com.github.camillara.confeitisys.model.repositories.ClienteRepository;
import com.github.camillara.confeitisys.model.repositories.UserRepository;
import com.github.camillara.confeitisys.rest.clientes.dto.ClienteFormRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository repository;

    @Autowired
    private UserRepository userRepository;

    // Converte o userId de String para Long
    private Long convertStringToLong(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (NumberFormatException e) {
            throw new OperacaoNaoPermitidaException("ID de usuário inválido.");
        }
    }

    public ResponseEntity<ClienteFormRequestDTO> salvar(ClienteFormRequestDTO request, String userId) {
        Long userLongId = convertStringToLong(userId); // Converte o userId
        User user = userRepository.findById(userLongId)
                .orElseThrow(() -> new OperacaoNaoPermitidaException("Usuário não encontrado"));

        Cliente cliente = request.toModel();
        cliente.setUser(user); // Vincula o cliente ao usuário logado
        repository.save(cliente);

        return ResponseEntity.ok(ClienteFormRequestDTO.fromModel(cliente));
    }

    public ResponseEntity<Void> atualizar(Long id, ClienteFormRequestDTO request, String userId) {
        Long userLongId = convertStringToLong(userId); // Converte o userId
        Optional<Cliente> clienteExistente = repository.findById(id);

        if (clienteExistente.isEmpty() || !clienteExistente.get().getUser().getId().equals(userLongId)) {
            return ResponseEntity.notFound().build();
        }

        Cliente cliente = request.toModel();
        cliente.setId(id);
        cliente.setUser(clienteExistente.get().getUser()); // Mantém o mesmo usuário

        repository.save(cliente);
        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<ClienteFormRequestDTO> getById(Long id, String userId) {
        Long userLongId = convertStringToLong(userId); // Converte o userId
        return repository.findById(id)
                .filter(cliente -> cliente.getUser().getId().equals(userLongId)) // Filtra pelo usuário logado
                .map(ClienteFormRequestDTO::fromModel)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public ResponseEntity<Object> delete(Long id, String userId) {
        Long userLongId = convertStringToLong(userId); // Converte o userId
        return repository.findById(id)
                .filter(cliente -> cliente.getUser().getId().equals(userLongId)) // Filtra pelo usuário logado
                .map(cliente -> {
                    verificarClienteVinculadoAVenda(cliente);
                    repository.delete(cliente);
                    return ResponseEntity.noContent().build();
                }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public Page<ClienteFormRequestDTO> getLista(String nome, String userId, Pageable pageable) {
        Long userLongId = convertStringToLong(userId); // Converte o userId
        return repository.buscarPorNome("%" + nome + "%", userLongId, pageable)
                .map(ClienteFormRequestDTO::fromModel);
    }

    private void verificarClienteVinculadoAVenda(Cliente cliente) {
        boolean clienteVinculado = repository.existsClienteVinculadoEmVenda(cliente.getId());
        if (clienteVinculado) {
            throw new OperacaoNaoPermitidaException("Não é possível excluir o cliente, pois ele está vinculado a uma venda.");
        }
    }
}
