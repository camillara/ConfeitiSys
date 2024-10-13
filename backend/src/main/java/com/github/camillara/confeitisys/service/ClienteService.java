package com.github.camillara.confeitisys.service;

import com.github.camillara.confeitisys.exception.OperacaoNaoPermitidaException;
import com.github.camillara.confeitisys.model.Cliente;
import com.github.camillara.confeitisys.model.repositories.ClienteRepository;
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

    public ResponseEntity<ClienteFormRequestDTO> salvar(ClienteFormRequestDTO request) {
        Cliente cliente = request.toModel();
        repository.save(cliente);
        return ResponseEntity.ok(ClienteFormRequestDTO.fromModel(cliente));
    }

    public ResponseEntity<Void> atualizar(Long id, ClienteFormRequestDTO request) {
        Optional<Cliente> clienteExistente = repository.findById(id);
        if (clienteExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Cliente cliente = request.toModel();
        cliente.setId(id);
        repository.save(cliente);
        return ResponseEntity.noContent().build();
    }

    public ResponseEntity<ClienteFormRequestDTO> getById(Long id) {
        return repository.findById(id).map(ClienteFormRequestDTO::fromModel)
                .map(clienteFR -> ResponseEntity.ok(clienteFR)).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public ResponseEntity<Object> delete(Long id) {
        return repository.findById(id).map(cliente -> {
            verificarClienteVinculadoAVenda(cliente);
            repository.delete(cliente);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public Page<ClienteFormRequestDTO> getLista(String nome, Pageable pageable) {
        return repository.buscarPorNome("%" + nome + "%", pageable)
                .map(ClienteFormRequestDTO::fromModel);
    }

    private void verificarClienteVinculadoAVenda(Cliente cliente) {
        boolean clienteVinculado = repository.existsClienteVinculadoEmVenda(cliente.getId());
        if (clienteVinculado) {
            throw new OperacaoNaoPermitidaException("Não é possível excluir o cliente, pois ele está vinculado a uma venda.");
        }
    }
}