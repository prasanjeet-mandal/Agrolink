package com.agrolink.repository;
import com.agrolink.entity.Payment; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface PaymentRepository extends JpaRepository<Payment,Long>{ Optional<Payment> findByOrderId(Long orderId); }
