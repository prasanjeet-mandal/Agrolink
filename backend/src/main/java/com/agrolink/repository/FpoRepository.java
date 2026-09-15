package com.agrolink.repository;


import com.agrolink.entity.Fpo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FpoRepository extends JpaRepository<Fpo, Long> {

    Optional<Fpo> findByUserEmail(String email);

    Optional<Fpo> findByUserId(Long userId);

    boolean existsByUserEmail(String email);

    boolean existsByUserId(Long userId);
}