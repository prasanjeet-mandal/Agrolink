package com.agrolink.service;

import com.agrolink.dto.delivery.DeliveryConfirmRequest;
import com.agrolink.dto.delivery.DeliveryStatusResponse;

public interface DeliveryService {

    DeliveryStatusResponse status(String email, Long orderId);

    DeliveryStatusResponse confirm(String email, DeliveryConfirmRequest r);
}