package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.Venda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long>{

    @Query(value = "SELECT * FROM tb_venda v " +
            "JOIN tb_cliente c ON v.id_cliente = c.id " +
            "WHERE (:nomeCliente IS NULL OR UPPER(c.nome) LIKE UPPER(CONCAT('%', :nomeCliente, '%'))) " +
            "AND (:formaPagamento IS NULL OR v.forma_pagamento = :formaPagamento) " +
            "AND (:statusPagamento IS NULL OR v.status_pagamento = :statusPagamento) " +
            "AND (:statusPedido IS NULL OR v.status_pedido = :statusPedido) ",
            nativeQuery = true)
    Page<Venda> buscarPorFiltros(
            @Param("nomeCliente") String nomeCliente,
            @Param("formaPagamento") String formaPagamento,
            @Param("statusPagamento") String statusPagamento,
            @Param("statusPedido") String statusPedido,
            Pageable pageable);

}
