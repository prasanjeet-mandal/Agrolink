package com.agrolink.repository;
import com.agrolink.entity.Product; import com.agrolink.enums.ProductStatus; import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.jpa.repository.Query; import org.springframework.data.repository.query.Param; import java.util.*;
public interface ProductRepository extends JpaRepository<Product,Long>{
 List<Product> findBySellerEmail(String email);
 List<Product> findByStatus(ProductStatus status);
 List<Product> findByCategoryId(Long categoryId);
 @Query("select p from Product p where p.status=:status and (lower(p.name) like lower(concat('%',:q,'%')) or lower(coalesce(p.description,'')) like lower(concat('%',:q,'%')))")
 List<Product> search(@Param("q") String q,@Param("status") ProductStatus status);
}
