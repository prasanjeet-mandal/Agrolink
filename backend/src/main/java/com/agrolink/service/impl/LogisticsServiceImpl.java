package com.agrolink.service.impl;

import com.agrolink.dto.logistics.*;
import com.agrolink.entity.*;
import com.agrolink.enums.LogisticsStatus;
import com.agrolink.enums.OrderStatus;
import com.agrolink.enums.Role;
import com.agrolink.repository.*;
import com.agrolink.service.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LogisticsServiceImpl implements LogisticsService {

    private final LogisticsRepository logistics;
    private final OrderRepository orders;
    private final UserRepository users;
    private final VehicleRepository vehicles;
    private final NotificationService notifications;

    public LogisticsServiceImpl(
            LogisticsRepository l,
            OrderRepository o,
            UserRepository u,
            VehicleRepository v,
            NotificationService n
    ) {
        logistics = l;
        orders = o;
        users = u;
        vehicles = v;
        notifications = n;
    }

    @Transactional
    public LogisticsResponse create(String email, Long orderId) {
        Order o = orders.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!o.getBuyer().getEmail().equals(email)) {
            throw new RuntimeException("Not your order");
        }
        if (logistics.findByOrderId(orderId).isPresent()) {
            return to(logistics.findByOrderId(orderId).get());
        }
        Logistics l = new Logistics();
        l.setOrder(o);
        l.setStatus(LogisticsStatus.CREATED);
        l.setPickupLocation(o.getItems().isEmpty() ? "Seller" : o.getItems().get(0).getProduct().getLocation());
        l.setDeliveryLocation(o.getShippingAddress().getCity() + ", " + o.getShippingAddress().getState());
        ShipmentResponse.RoutePoint origin = coords(l.getPickupLocation());
        ShipmentResponse.RoutePoint destination = coords(l.getDeliveryLocation());
        l.setPickupLatitude(origin.lat());
        l.setPickupLongitude(origin.lng());
        l.setDeliveryLatitude(destination.lat());
        l.setDeliveryLongitude(destination.lng());
        return to(logistics.save(l));
    }

    @Transactional
    public LogisticsResponse assign(String email, Long id, AssignDeliveryRequest r) {
        Logistics l = get(id);
        User caller = users.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (caller.getRole() != Role.DELIVERY_PARTNER) {
            throw new RuntimeException("Only delivery partners can accept deliveries");
        }
        User u = users.findById(r.deliveryPartnerId()).orElseThrow(() -> new RuntimeException("Delivery partner not found"));
        if (u.getRole() != Role.DELIVERY_PARTNER) {
            throw new RuntimeException("User is not a delivery partner");
        }
        if (!u.getEmail().equals(email)) {
            throw new RuntimeException("You can only accept a delivery for yourself");
        }
        l.setDeliveryPartner(u);
        l.setStatus(LogisticsStatus.ASSIGNED);
        return to(logistics.save(l));
    }

    @Transactional
    public LogisticsResponse status(String email, Long id, LogisticsStatusRequest r) {
        Logistics l = get(id);
        User caller = users.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (caller.getRole() != Role.DELIVERY_PARTNER) {
            throw new RuntimeException("Only delivery partners can update delivery status");
        }
        if (l.getDeliveryPartner() != null && !l.getDeliveryPartner().getEmail().equals(email)) {
            throw new RuntimeException("This delivery is assigned to another partner");
        }
        LogisticsStatus s = LogisticsStatus.valueOf(r.status().toUpperCase());
        l.setStatus(s);
        OrderStatus target = switch (s) {
            case PICKED_UP -> OrderStatus.SHIPPED;
            case IN_TRANSIT, OUT_FOR_DELIVERY -> OrderStatus.OUT_FOR_DELIVERY;
            case DELIVERED -> OrderStatus.DELIVERED;
            default -> null;
        };
        if (target != null && l.getOrder().getStatus().ordinal() < target.ordinal()) {
            l.getOrder().setStatus(target);
        }
        notifications.create(l.getOrder().getBuyer().getEmail(), "Logistics update", "Order #" + l.getOrder().getId() + " is " + s.name(), "LOGISTICS");
        l.getOrder().getItems().stream()
                .map(i -> i.getProduct().getSeller().getEmail())
                .distinct()
                .forEach(se -> notifications.create(se, "Logistics update", "Order #" + l.getOrder().getId() + " is " + s.name(), "LOGISTICS"));
        return to(logistics.save(l));
    }

    @Transactional(readOnly=true) public List<LogisticsResponse> mine(String email) {
        return logistics.findAll().stream()
                .filter(x -> x.getDeliveryPartner() == null
                        || (x.getDeliveryPartner().getEmail() != null && x.getDeliveryPartner().getEmail().equals(email)))
                .map(this::to)
                .toList();
    }

    @Transactional
    public LogisticsResponse location(String email, Long id, UpdateLocationRequest r) {
        Logistics l = get(id);
        if (l.getDeliveryPartner() == null || !l.getDeliveryPartner().getEmail().equals(email)) {
            throw new RuntimeException("Only the assigned delivery partner can share live location");
        }
        l.setCurrentLatitude(r.latitude());
        l.setCurrentLongitude(r.longitude());
        return to(logistics.save(l));
    }

    @Transactional
    public LogisticsResponse route(Long id) {
        Logistics l = get(id);
        String a = l.getPickupLocation() == null ? "Pickup" : l.getPickupLocation();
        String b = l.getDeliveryLocation() == null ? "Delivery" : l.getDeliveryLocation();
        double d = estimate(a, b);
        l.setDistanceKm(d);
        l.setEtaMinutes((int) Math.ceil(d / 35.0 * 60));
        l.setRouteSummary("Estimated route: " + a + " -> " + b);
        return to(logistics.save(l));
    }

    @Transactional(readOnly=true) public List<ShipmentResponse> shipments() {
        return logistics.findAll().stream().map(this::toShipment).toList();
    }

    @Transactional(readOnly=true) public ShipmentResponse shipment(Long id) {
        Logistics l = get(id);
        return toShipment(l);
    }

    @Transactional(readOnly=true) public ShipmentResponse shipmentForOrder(Long orderId) {
        return logistics.findByOrderId(orderId).map(this::toShipment).orElse(null);
    }

    @Transactional(readOnly=true) public List<ShipmentResponse.Vehicle> vehicles() {
        return vehicles.findAll().stream()
                .map(v -> new ShipmentResponse.Vehicle(v.getId(), v.getType(), v.getPlate(), v.getDriverName(), v.getDriverPhone(), v.getStatus()))
                .toList();
    }

    private ShipmentResponse toShipment(Logistics l) {
        String pickup = l.getPickupLocation() == null ? "Pickup" : l.getPickupLocation();
        String delivery = l.getDeliveryLocation() == null ? "Delivery" : l.getDeliveryLocation();
        double distance = l.getDistanceKm() != null ? l.getDistanceKm() : estimate(pickup, delivery);
        int etaMinutes = l.getEtaMinutes() != null ? l.getEtaMinutes() : (int) Math.ceil(distance / 35.0 * 60);

        ShipmentResponse.RoutePoint origin = coords(pickup);
        ShipmentResponse.RoutePoint destination = coords(delivery);
        ShipmentResponse.RoutePoint current =
                (l.getStatus() == LogisticsStatus.IN_TRANSIT || l.getStatus() == LogisticsStatus.OUT_FOR_DELIVERY)
                        ? new ShipmentResponse.RoutePoint("Live", (origin.lat() + destination.lat()) / 2, (origin.lng() + destination.lng()) / 2)
                        : null;

        ShipmentResponse.Vehicle vehicle = vehicles.findAll().stream()
                .filter(v -> "ASSIGNED".equalsIgnoreCase(v.getStatus()))
                .findFirst()
                .map(v -> new ShipmentResponse.Vehicle(v.getId(), v.getType(), v.getPlate(), v.getDriverName(), v.getDriverPhone(), v.getStatus()))
                .orElse(null);

        LocalDateTime now = LocalDateTime.now();
        double charge = Math.round(distance * 9.0 * 100.0) / 100.0;

        return new ShipmentResponse(
                l.getId(),
                "SHIP-" + String.format("%04d", l.getId()),
                l.getOrder().getId(),
                l.getStatus().name(),
                pickup,
                delivery,
                List.of(origin, destination),
                vehicle,
                Math.round(distance * 100.0) / 100.0,
                etaMinutes,
                charge,
                now.plusMinutes(etaMinutes),
                now,
                current
        );
    }

    private double estimate(String a, String b) {
        return Math.max(5.0, Math.min(500.0, Math.abs((a.hashCode() % 1000) - (b.hashCode() % 1000)) / 2.0));
    }

    private ShipmentResponse.RoutePoint coords(String place) {
        long h = (place == null ? "Pickup" : place).hashCode() & 0x7fffffff;
        double lat = 8.0 + (h % 2900) / 100.0;
        double lng = 68.0 + ((h >> 8) % 2900) / 100.0;
        return new ShipmentResponse.RoutePoint(place == null ? "Pickup" : place, round(lat), round(lng));
    }

    private double round(double v) {
        return Math.round(v * 10000.0) / 10000.0;
    }

    private Logistics get(Long id) {
        return logistics.findById(id).orElseThrow(() -> new RuntimeException("Logistics not found"));
    }

    private LogisticsResponse to(Logistics l) {
        Order o = l.getOrder();
        List<LogisticsResponse.Item> items = o.getItems().stream()
                .map(i -> new LogisticsResponse.Item(
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getQuantity(),
                        i.getProduct().getUnit(),
                        i.getUnitPrice(),
                        i.getLineTotal()))
                .toList();
        Address address = o.getShippingAddress();
        LogisticsResponse.DeliveryAddress da = address == null
                ? null
                : new LogisticsResponse.DeliveryAddress(
                        address.getAddressLine(), address.getCity(), address.getState(), address.getPincode());
        return new LogisticsResponse(
                l.getId(),
                o.getId(),
                "AGL-" + String.format("%05d", o.getId()),
                l.getDeliveryPartner() == null ? null : l.getDeliveryPartner().getId(),
                l.getStatus().name(),
                l.getPickupLocation(),
                l.getDeliveryLocation(),
                l.getDistanceKm(),
                l.getEtaMinutes(),
                l.getRouteSummary(),
                o.getBuyer().getFullName(),
                items,
                o.getTotalAmount(),
                da,
                o.getCreatedAt(),
                l.getPickupLatitude(),
                l.getPickupLongitude(),
                l.getDeliveryLatitude(),
                l.getDeliveryLongitude(),
                l.getCurrentLatitude(),
                l.getCurrentLongitude()
        );
    }
}