package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.ItemVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemVendaRepository extends JpaRepository<ItemVenda, Long> {

    @Query("SELECT i.id, i.produto.id FROM ItemVenda i WHERE i.venda.id = :idVenda")
    List<Object[]> findItemVendaIdsAndProdutoIdsByVendaId(@Param("idVenda") Long idVenda);

    List<ItemVenda> findByVendaId(Long vendaId);
}