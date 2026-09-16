package com.agrolink.repository;


import com.agrolink.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {

    Optional<Farmer> findByUserEmail(String email);

    Optional<Farmer> findByUserId(Long userId);

    boolean existsByUserEmail(String email);

    boolean existsByUserId(Long userId);
}