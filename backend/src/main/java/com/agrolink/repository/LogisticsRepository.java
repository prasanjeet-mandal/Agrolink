package com.agrolink.repository;
import com.agrolink.entity.Logistics; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface LogisticsRepository extends JpaRepository<Logistics,Long>{ Optional<Logistics> findByOrderId(Long orderId); }
