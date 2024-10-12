package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.ItemDetalhadoVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemDetalhadoVendaRepository extends JpaRepository<ItemDetalhadoVenda, Long> {

    @Query("SELECT id FROM ItemDetalhadoVenda i WHERE i.itemVenda.id = :idItemVenda")
    List<Long> findIdsByItemVendaId(@Param("idItemVenda") Long idItemVenda);

}
