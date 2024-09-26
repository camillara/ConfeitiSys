package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long>{

}
