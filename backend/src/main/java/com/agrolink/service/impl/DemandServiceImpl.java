package com.agrolink.service.impl;

import com.agrolink.dto.demand.DemandForecastResponse;
import com.agrolink.dto.demand.DemandListResponse;
import com.agrolink.entity.Order;
import com.agrolink.entity.Product;
import com.agrolink.enums.OrderStatus;
import com.agrolink.repository.OrderRepository;
import com.agrolink.repository.ProductRepository;
import com.agrolink.service.DemandService;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

@Service
public class DemandServiceImpl implements DemandService {

    private final ProductRepository products;
    private final OrderRepository orders;

    public DemandServiceImpl(ProductRepository products, OrderRepository orders) {
        this.products = products;
        this.orders = orders;
    }

    public DemandListResponse forecasts() {
        List<DemandForecastResponse> rows = products.findAll().stream()
                .sorted(Comparator.comparing(Product::getId))
                .map(this::build)
                .toList();
        return new DemandListResponse(rows);
    }

    public DemandForecastResponse forecastFor(Long productId) {
        Product p = products.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        return build(p);
    }

    private DemandForecastResponse build(Product p) {
        double sold = orders.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .flatMap(o -> o.getItems().stream())
                .filter(i -> i.getProduct().getId().equals(p.getId()))
                .mapToDouble(i -> i.getQuantity())
                .sum();

        double stock = p.getAvailableQuantity() == null ? 0 : p.getAvailableQuantity();
        double ratio = stock > 0 ? sold / stock : sold;
        String level = sold <= 0 ? "MEDIUM" : ratio >= 0.5 ? "HIGH" : ratio >= 0.15 ? "MEDIUM" : "LOW";

        Random rnd = new Random(p.getId() * 17);
        LocalDateTime now = LocalDateTime.now();
        double base = Math.max(5.0, sold > 0 ? sold * 12.0 : 40.0);

        List<DemandForecastResponse.Point> history = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            history.add(new DemandForecastResponse.Point(now.minusMonths(i), round2(base * (0.7 + rnd.nextDouble() * 0.6))));
        }
        List<DemandForecastResponse.Point> forecast = new ArrayList<>();
        double growth = "HIGH".equals(level) ? 0.25 : "LOW".equals(level) ? -0.1 : 0.08;
        for (int i = 1; i <= 6; i++) {
            forecast.add(new DemandForecastResponse.Point(now.plusMonths(i), round2(base * (1 + growth * i / 3.0))));
        }

        return new DemandForecastResponse(
                "d" + p.getId(),
                p.getId(),
                p.getName(),
                districtOf(p.getLocation()),
                level,
                history,
                forecast,
                0.82
        );
    }

    private String districtOf(String location) {
        if (location == null) {
            return "Unknown";
        }
        return location.split(",")[0].trim();
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}