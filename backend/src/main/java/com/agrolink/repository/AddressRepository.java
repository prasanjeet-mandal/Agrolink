package com.agrolink.repository;


import com.agrolink.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserEmail(String email);

    Optional<Address> findByIdAndUserEmail(Long id, String email);
}
