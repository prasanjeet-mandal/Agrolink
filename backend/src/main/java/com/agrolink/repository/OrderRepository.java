package com.agrolink.repository;
import com.agrolink.entity.Order; import com.agrolink.enums.OrderStatus; import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.jpa.repository.Query; import org.springframework.data.repository.query.Param; import java.util.*;
public interface OrderRepository extends JpaRepository<Order,Long>{
 List<Order> findByBuyerEmailOrderByCreatedAtDesc(String email);
 List<Order> findByStatus(OrderStatus status);
 @Query("select distinct o from Order o join o.items i where i.product.seller.email=:email order by o.createdAt desc")
 List<Order> findBySellerEmailOrderByCreatedAtDesc(@Param("email") String email);
}