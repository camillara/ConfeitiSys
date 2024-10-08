package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    boolean existsByItensProdutoItemProdutoId(Long id);

    @Query("SELECT COUNT(ip) > 0 FROM ItemProduto ip WHERE ip.itemProduto.id = :produtoId")
    boolean isProdutoUsadoComoItem(@Param("produtoId") Long produtoId);
}
