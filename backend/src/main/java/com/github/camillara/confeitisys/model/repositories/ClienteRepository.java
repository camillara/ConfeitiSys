package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

	@Query("select c from Cliente c where upper(c.nome) like upper(:nome)")
	Page<Cliente> buscarPorNome(@Param("nome") String nome, Pageable pageable);

	@Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM Venda v WHERE v.cliente.id = :clienteId")
	boolean existsClienteVinculadoEmVenda(@Param("clienteId") Long clienteId);

}
