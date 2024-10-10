package com.github.camillara.confeitisys.model.repositories;

import com.github.camillara.confeitisys.model.Produto;
import com.github.camillara.confeitisys.model.enums.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("SELECT p FROM Produto p WHERE upper(p.nome) like upper(:nome) " +
            "AND (:categoria IS NULL OR p.categoria = :categoria)")
    Page<Produto> buscarPorNomeECategoria(@Param("nome") String nome, @Param("categoria") Categoria categoria, Pageable pageable);


    @Query("SELECT COUNT(ip) > 0 FROM ItemProduto ip WHERE ip.itemProduto.id = :produtoId")
    boolean isProdutoUsadoComoItem(@Param("produtoId") Long produtoId);

    // Método para listar todos os produtos que utilizam um determinado itemProduto
    @Query("SELECT p FROM Produto p JOIN p.itensProduto ip WHERE ip.itemProduto.id = :itemProdutoId")
    List<Produto> findProdutosByItemProdutoId(@Param("itemProdutoId") Long itemProdutoId);

    @Query("SELECT CASE WHEN COUNT(iv) > 0 THEN true ELSE false END FROM ItemVenda iv WHERE iv.produto.id = :produtoId")
    boolean existsProdutoVinculadoEmItemVenda(@Param("produtoId") Long produtoId);

    @Query("SELECT CASE WHEN COUNT(idv) > 0 THEN true ELSE false END FROM ItemDetalhadoVenda idv WHERE idv.produto.id = :produtoId")
    boolean existsProdutoVinculadoEmItemDetalhadoVenda(@Param("produtoId") Long produtoId);

}
