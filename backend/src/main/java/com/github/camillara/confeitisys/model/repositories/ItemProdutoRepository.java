package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.ItemProduto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemProdutoRepository extends JpaRepository<ItemProduto, Long> {
}