package com.agrolink.service.impl;

import com.agrolink.dto.delivery.DeliveryConfirmRequest;
import com.agrolink.dto.delivery.DeliveryStatusResponse;
import com.agrolink.entity.Logistics;
import com.agrolink.entity.Order;
import com.agrolink.enums.LogisticsStatus;
import com.agrolink.enums.OrderStatus;
import com.agrolink.repository.LogisticsRepository;
import com.agrolink.repository.OrderRepository;
import com.agrolink.service.DeliveryService;
import com.agrolink.service.NotificationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private final OrderRepository orders;
    private final LogisticsRepository logistics;
    private final NotificationService notifications;

    public DeliveryServiceImpl(
            OrderRepository orders,
            LogisticsRepository logistics,
            NotificationService notifications
    ) {
        this.orders = orders;
        this.logistics = logistics;
        this.notifications = notifications;
    }

    public DeliveryStatusResponse status(String email, Long orderId) {
        Order o = orders.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        return new DeliveryStatusResponse(o.getId(), String.format("AGL-2026-%05d", o.getId()), o.getStatus().name());
    }

    @Transactional
    public DeliveryStatusResponse confirm(String email, DeliveryConfirmRequest r) {
        Order o = orders.findById(r.orderId()).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!o.getBuyer().getEmail().equals(email)) {
            throw new RuntimeException("Only the buyer can confirm delivery");
        }
        o.setStatus(OrderStatus.DELIVERED);
        orders.save(o);

        logistics.findByOrderId(o.getId()).ifPresent(l -> {
            l.setStatus(LogisticsStatus.DELIVERED);
            logistics.save(l);
        });

        String sellers = o.getItems().stream()
                .map(i -> i.getProduct().getSeller().getEmail())
                .distinct()
                .collect(Collectors.joining(","));
        if (!sellers.isBlank()) {
            for (String seller : sellers.split(",")) {
                notifications.create(seller, "Delivery confirmed", "Order #" + String.format("AGL-2026-%05d", o.getId()) + " was delivered by " + o.getBuyer().getFullName(), "ORDER");
            }
        }

        return new DeliveryStatusResponse(o.getId(), String.format("AGL-2026-%05d", o.getId()), o.getStatus().name());
    }
}