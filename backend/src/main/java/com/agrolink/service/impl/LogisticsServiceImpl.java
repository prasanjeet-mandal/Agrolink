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
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class LogisticsServiceImpl implements LogisticsService {

    private final LogisticsRepository logistics;
    private final OrderRepository orders;
    private final UserRepository users;
    private final VehicleRepository vehicles;
    private final NotificationService notifications;
    private final RestTemplate rest;

    public LogisticsServiceImpl(
            LogisticsRepository l,
            OrderRepository o,
            UserRepository u,
            VehicleRepository v,
            NotificationService n,
            RestTemplate rest
    ) {
        logistics = l;
        orders = o;
        users = u;
        vehicles = v;
        notifications = n;
        this.rest = rest;
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

        ShipmentResponse.RoutePoint origin = resolveOrigin(o);
        if (origin == null) origin = geocode(l.getPickupLocation());
        ShipmentResponse.RoutePoint destination = resolveDestination(o);
        if (destination == null) destination = geocode(l.getDeliveryLocation());

        l.setPickupLatitude(origin == null ? null : origin.lat());
        l.setPickupLongitude(origin == null ? null : origin.lng());
        l.setDeliveryLatitude(destination == null ? null : destination.lat());
        l.setDeliveryLongitude(destination == null ? null : destination.lng());
        backfillCoords(o, origin, destination);
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

        ShipmentResponse.RoutePoint origin = resolveOrigin(l.getOrder());
        if (origin == null && l.getPickupLatitude() != null && l.getPickupLongitude() != null) {
            origin = new ShipmentResponse.RoutePoint(pickup, l.getPickupLatitude(), l.getPickupLongitude());
        }
        ShipmentResponse.RoutePoint destination = resolveDestination(l.getOrder());
        if (destination == null && l.getDeliveryLatitude() != null && l.getDeliveryLongitude() != null) {
            destination = new ShipmentResponse.RoutePoint(delivery, l.getDeliveryLatitude(), l.getDeliveryLongitude());
        }

        ShipmentResponse.RoutePoint current;
        if (l.getCurrentLatitude() != null && l.getCurrentLongitude() != null) {
            current = new ShipmentResponse.RoutePoint("Live", l.getCurrentLatitude(), l.getCurrentLongitude());
        } else {
            current = null;
        }

        double distance = haversineKm(origin, destination);
        if (distance < 0) distance = estimate(pickup, delivery);
        if (l.getDistanceKm() != null && l.getDistanceKm() > 0) distance = l.getDistanceKm();
        int etaMinutes = l.getEtaMinutes() != null && l.getEtaMinutes() > 0
                ? l.getEtaMinutes()
                : (int) Math.ceil(distance / 35.0 * 60);

        List<ShipmentResponse.RoutePoint> route = new ArrayList<>();
        if (origin != null) route.add(origin);
        if (current != null) {
            boolean sameAsOrigin = origin != null && current.lat() == origin.lat() && current.lng() == origin.lng();
            boolean sameAsDest = destination != null && current.lat() == destination.lat() && current.lng() == destination.lng();
            if (!sameAsOrigin && !sameAsDest) route.add(current);
        }
        if (destination != null) route.add(destination);

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
                route,
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

    private ShipmentResponse.RoutePoint resolveOrigin(Order o) {
        if (o == null || o.getItems() == null) return null;
        for (com.agrolink.entity.OrderItem it : o.getItems()) {
            Product p = it.getProduct();
            if (p != null && p.getLatitude() != null && p.getLongitude() != null) {
                return new ShipmentResponse.RoutePoint(
                        p.getLocation() == null ? "Pickup" : p.getLocation(),
                        p.getLatitude(), p.getLongitude());
            }
        }
        return null;
    }

    private ShipmentResponse.RoutePoint resolveDestination(Order o) {
        if (o == null || o.getShippingAddress() == null) return null;
        Address a = o.getShippingAddress();
        if (a.getLatitude() != null && a.getLongitude() != null) {
            return new ShipmentResponse.RoutePoint(
                    a.getCity() + ", " + a.getState(), a.getLatitude(), a.getLongitude());
        }
        return null;
    }

    private void backfillCoords(Order o, ShipmentResponse.RoutePoint origin, ShipmentResponse.RoutePoint destination) {
        if (o == null) return;
        if (origin != null && o.getItems() != null) {
            for (com.agrolink.entity.OrderItem it : o.getItems()) {
                Product p = it.getProduct();
                if (p != null && p.getLatitude() == null) {
                    p.setLatitude(origin.lat());
                    p.setLongitude(origin.lng());
                }
            }
        }
        Address a = o.getShippingAddress();
        if (destination != null && a != null && a.getLatitude() == null) {
            a.setLatitude(destination.lat());
            a.setLongitude(destination.lng());
        }
    }

    private ShipmentResponse.RoutePoint geocode(String place) {
        if (place == null || place.isBlank()) return null;
        try {
            String q = URLEncoder.encode(place + ", India", StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "AgroLink/1.0 (agrolink.app contact@agrolink.in)");
            headers.set("Accept-Language", "en");
            String body = rest.exchange(
                    "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=" + q,
                    HttpMethod.GET, new HttpEntity<>(headers), String.class).getBody();
            if (body == null || body.isBlank() || body.strip().equals("[]")) return null;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> hits = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(body, List.class);
            if (hits.isEmpty()) return null;
            Map<String, Object> first = hits.get(0);
            double lat = Double.parseDouble(String.valueOf(first.get("lat")));
            double lng = Double.parseDouble(String.valueOf(first.get("lon")));
            String display = place;
            if (first.get("display_name") != null) {
                display = String.valueOf(first.get("display_name")).split(",")[0] + ", " + place;
            }
            return new ShipmentResponse.RoutePoint(display, round(lat), round(lng));
        } catch (Exception ignored) {
            return null;
        }
    }

    /** Great-circle distance in km between two points, -1 when either is missing. */
    private double haversineKm(ShipmentResponse.RoutePoint a, ShipmentResponse.RoutePoint b) {
        if (a == null || b == null) return -1;
        double r = 6371.0;
        double dLat = Math.toRadians(b.lat() - a.lat());
        double dLng = Math.toRadians(b.lng() - a.lng());
        double h = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(a.lat())) * Math.cos(Math.toRadians(b.lat()))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 2 * r * Math.asin(Math.sqrt(Math.min(1, h)));
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