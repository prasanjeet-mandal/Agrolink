package com.agrolink.repository;


import com.agrolink.entity.DeliveryPartnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryPartnerProfileRepository extends JpaRepository<DeliveryPartnerProfile, Long> {

    Optional<DeliveryPartnerProfile> findByUserId(Long userId);
}