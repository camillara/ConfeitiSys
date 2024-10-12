package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.Venda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long>{

    @Query(value = "SELECT * FROM tb_venda v JOIN tb_cliente c ON v.id_cliente = c.id WHERE UPPER(c.nome) LIKE UPPER(CONCAT('%', :nomeCliente, '%'))", nativeQuery = true)
    Page<Venda> buscarPorNomeCliente(@Param("nomeCliente") String nomeCliente, Pageable pageable);


}
