package com.agrolink.service.impl;

import com.agrolink.dto.address.AddressRequest;
import com.agrolink.dto.address.AddressResponse;
import com.agrolink.entity.Address;
import com.agrolink.entity.User;
import com.agrolink.repository.AddressRepository;
import com.agrolink.repository.UserRepository;
import com.agrolink.service.AddressService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressServiceImpl(
            AddressRepository addressRepository,
            UserRepository userRepository
    ) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public AddressResponse create(
            String email,
            AddressRequest request
    ) {

        User user = getUser(email);

        Address address = new Address();

        address.setUser(user);
        setFields(address, request);

        return toResponse(
                addressRepository.save(address)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAll(
            String email
    ) {

        return addressRepository
                .findByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponse update(
            String email,
            Long addressId,
            AddressRequest request
    ) {

        Address address =
                addressRepository
                        .findByIdAndUserEmail(
                                addressId,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found"
                                )
                        );

        setFields(address, request);

        return toResponse(
                addressRepository.save(address)
        );
    }

    @Override
    @Transactional
    public void delete(
            String email,
            Long addressId
    ) {

        Address address =
                addressRepository
                        .findByIdAndUserEmail(
                                addressId,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address not found"
                                )
                        );

        addressRepository.delete(address);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    private void setFields(
            Address address,
            AddressRequest request
    ) {

        address.setAddressLine(
                request.addressLine()
        );
        address.setVillage(request.village());
        address.setCity(request.city());
        address.setDistrict(request.district());
        address.setState(request.state());
        address.setPincode(request.pincode());
        address.setAddressType(
                request.addressType()
        );
    }

    private AddressResponse toResponse(
            Address address
    ) {

        return new AddressResponse(
                address.getId(),
                address.getAddressLine(),
                address.getVillage(),
                address.getCity(),
                address.getDistrict(),
                address.getState(),
                address.getPincode(),
                address.getAddressType()
        );
    }
}
