package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

}
