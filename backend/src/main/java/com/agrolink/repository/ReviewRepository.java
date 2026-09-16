package com.agrolink.repository;
import com.agrolink.entity.Review; import com.agrolink.enums.ReviewStatus; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ReviewRepository extends JpaRepository<Review,Long>{ List<Review> findByProductIdAndStatus(Long productId,ReviewStatus status); boolean existsByBuyerEmailAndProductId(String email,Long productId); }
