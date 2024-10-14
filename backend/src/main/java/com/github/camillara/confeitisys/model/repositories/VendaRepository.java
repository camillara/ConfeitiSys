package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.Venda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long>{

    @Query(value = "SELECT * FROM tb_venda v " +
            "JOIN tb_cliente c ON v.id_cliente = c.id " +
            "WHERE (:nomeCliente IS NULL OR UPPER(c.nome) LIKE UPPER(CONCAT('%', :nomeCliente, '%'))) " +
            "AND (:formaPagamento IS NULL OR v.forma_pagamento = :formaPagamento) " +
            "AND (:statusPagamento IS NULL OR v.status_pagamento = :statusPagamento) " +
            "AND (:statusPedido IS NULL OR v.status_pedido = :statusPedido) " +
            "AND v.user_id = :userId",
            nativeQuery = true)
    Page<Venda> buscarPorFiltros(
            @Param("nomeCliente") String nomeCliente,
            @Param("formaPagamento") String formaPagamento,
            @Param("statusPagamento") String statusPagamento,
            @Param("statusPedido") String statusPedido,
            @Param("userId") Long userId, // Adiciona o userId como parâmetro
            Pageable pageable);

    @Query("SELECT v FROM Venda v WHERE v.id = :id AND v.user.id = :userId")
    Optional<Venda> findByIdEUser(@Param("id") Long id, @Param("userId") Long userId);

}
