package com.agrolink.repository;


import com.agrolink.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmRepository extends JpaRepository<Farm, Long> {

    List<Farm> findByFarmerUserEmail(String email);

    List<Farm> findByFarmerId(Long farmerId);
}
