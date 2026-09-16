package com.agrolink.service;


import com.agrolink.dto.address.AddressRequest;
import com.agrolink.dto.address.AddressResponse;

import java.util.List;

public interface AddressService {

    AddressResponse create(
            String email,
            AddressRequest request
    );

    List<AddressResponse> getAll(String email);

    AddressResponse update(
            String email,
            Long addressId,
            AddressRequest request
    );

    void delete(
            String email,
            Long addressId
    );
}
