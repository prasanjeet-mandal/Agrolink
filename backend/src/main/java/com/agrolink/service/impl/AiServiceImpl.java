package com.agrolink.service.impl;

import com.agrolink.dto.ai.*;
import com.agrolink.entity.Order;
import com.agrolink.entity.Product;
import com.agrolink.enums.OrderStatus;
import com.agrolink.repository.OrderRepository;
import com.agrolink.repository.ProductRepository;
import com.agrolink.service.AiService;
import com.agrolink.service.MlClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.text.DecimalFormat;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class AiServiceImpl implements AiService {

    private final String url;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final MlClient ml;

    public AiServiceImpl(
            @Value("${app.ai.python-url:http://localhost:8000}") String url,
            ProductRepository products,
            OrderRepository orders,
            MlClient ml
    ) {
        this.url = url;
        this.products = products;
        this.orders = orders;
        this.ml = ml;
    }

    public CropPredictionResponse crop(CropPredictionRequest r) {
        try {
            return RestClient.create(url).post().uri("/predict/crop").body(r).retrieve().body(CropPredictionResponse.class);
        } catch (Exception ignored) {
            String s = r.soilType().toLowerCase(), season = r.season().toLowerCase();
            String c = s.contains("alluvial") && season.contains("winter") ? "Wheat"
                    : season.contains("monsoon") ? "Rice"
                    : s.contains("black") ? "Cotton"
                    : "Maize";
            double conf = Math.min(.95, .72 + (r.rainfallMm() >= 500 && r.rainfallMm() <= 1000 ? .1 : 0));
            return new CropPredictionResponse(c, conf, "Fallback rule-based prediction; Python AI service unavailable.", 3.5);
        }
    }

    public DemandPredictionResponse demand(DemandPredictionRequest r) {
        int month = java.time.LocalDate.now().getMonthValue();
        var base = new MlClient.Base("Roorkee APMC", "Vegetables", r.productName());
        Optional<Double> predicted = ml.predictDemand(base, priceQtlOf(r), month, r.historicalWeeklySales());
        if (predicted.isPresent()) {
            double weekly = predicted.get();
            double reorder = Math.round(Math.max(0, weekly - r.currentStock()) * 100) / 100.0;
            return new DemandPredictionResponse(r.productName(), Math.round(weekly * 100) / 100.0, reorder,
                    weekly > r.currentStock() * 0.8 ? "Reorder recommended — ai-service model" : "Current stock is sufficient — ai-service model");
        }
        double d = r.historicalWeeklySales() * r.seasonalFactor();
        return new DemandPredictionResponse(r.productName(), Math.round(d * 100) / 100.0,
                Math.round(Math.max(0, d - r.currentStock()) * 100) / 100.0,
                d > r.currentStock() ? "Reorder recommended" : "Current stock is sufficient");
    }

    private double priceQtlOf(DemandPredictionRequest r) {
        return 90 * r.historicalWeeklySales() + 1000;
    }

    public YieldPredictionResponse yield(YieldPredictionRequest r) {
        try {
            return RestClient.create(url).post().uri("/predict/yield").body(r).retrieve().body(YieldPredictionResponse.class);
        } catch (Exception ignored) {
            double b = switch (r.crop().toLowerCase()) {
                case "wheat" -> 18;
                case "rice" -> 22;
                case "maize" -> 20;
                case "potato" -> 60;
                default -> 15;
            };
            double rain = r.rainfallMm() >= 500 && r.rainfallMm() <= 1000 ? 1.1 : .85;
            double fert = Math.min(1.2, .9 + r.fertilizerKgPerAcre() / 200);
            double per = b * rain * fert;
            return new YieldPredictionResponse(r.crop(), Math.round(per * 100) / 100.0,
                    Math.round(per * r.landArea() * 100) / 100.0, "quintal",
                    "Fallback rule-based estimate; Python AI service unavailable.");
        }
    }

    @Transactional(readOnly = true)
    public ChatResponse chat(ChatRequest r) {
        try {
            return RestClient.create(url)
                    .post()
                    .uri(uriBuilder -> uriBuilder
                        .path("/chat")
                        .queryParam("question", r.getQuestion())
                        .queryParam("context", websiteContext())
                        .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(ChatResponse.class);
        } catch (Exception ignored) {
            // Keep the marketplace-aware fallback available when the AI service is offline.
        }

        String q = r.getQuestion() == null ? "" : r.getQuestion().toLowerCase(Locale.ROOT);
        String answer = tryProductMatch(q)
                .orElseGet(() -> tryDemand(q).orElseGet(() -> tryMarket(q)));
        return new ChatResponse(answer, "live agrolink data");
    }

        private String websiteContext() {
        List<Product> all = products.findAll();
        double average = all.stream()
            .filter(p -> p.getPrice() != null)
            .mapToDouble(p -> p.getPrice().doubleValue())
            .average()
            .orElse(0);
        long units = orders.findAll().stream()
            .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
            .flatMap(o -> o.getItems().stream())
            .mapToLong(i -> i.getQuantity().longValue())
            .sum();

        StringBuilder context = new StringBuilder("stats|listings=")
            .append(all.size())
            .append("|averagePrice=")
            .append(new DecimalFormat("0.00").format(average))
            .append("|orderedUnits=")
            .append(units)
            .append(";products=");
        all.stream().limit(50).forEach(p -> context
            .append(p.getName()).append('~')
            .append(p.getPrice()).append('~')
            .append(p.getUnit()).append('~')
            .append(p.getAvailableQuantity()).append(';'));
        return context.toString();
    }

    private Optional<String> tryProductMatch(String q) {
        List<Product> all = products.findAll();
        for (Product p : all) {
            String name = p.getName() == null ? "" : p.getName().toLowerCase(Locale.ROOT);
            boolean hit = false;
            for (String tok : name.split("\\s+")) {
                if (tok.length() > 3 && q.contains(tok)) {
                    hit = true;
                    break;
                }
            }
            if (hit) {
                String price = new DecimalFormat("#,##0.00").format(p.getPrice());
                Object qty = p.getAvailableQuantity() == null ? 0 : new DecimalFormat("#,##0").format(p.getAvailableQuantity());
                return Optional.of(String.format(
                        "%s is currently listed at Rs %s per %s on Agrolink, with %s %s in stock from %s. Use the marketplace to place an order.",
                        p.getName(), price, p.getUnit(), qty, p.getUnit(),
                        p.getSeller() == null ? "a verified producer" : p.getSeller().getFullName()));
            }
        }
        return Optional.empty();
    }

    private Optional<String> tryDemand(String q) {
        if (!q.contains("demand") && !q.contains("sell") && !q.contains("market")) {
            return Optional.empty();
        }
        long units = orders.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .flatMap(o -> o.getItems().stream())
                .mapToLong(i -> i.getQuantity().longValue())
                .sum();
        long skus = products.findAll().size();
        return Optional.of(String.format(
                "Across the marketplace there are %d active produce listings and %d units have been ordered so far. High-demand categories trend fastest — list fresh stock to get in front of buyers.",
                skus, units));
    }

    private String tryMarket(String q) {
        List<Product> all = products.findAll();
        double avg = all.stream()
                .filter(p -> p.getPrice() != null)
                .mapToDouble(p -> p.getPrice().doubleValue())
                .average()
                .orElse(0);
        Optional<Product> top = all.stream()
                .filter(p -> p.getAvailableQuantity() != null)
                .max(Comparator.comparing(Product::getAvailableQuantity));
        return String.format(
                "Agrolink runs as a direct marketplace — produce is listed by verified farmers and FPOs and shipped to your door. Average listing price across %d commodities is Rs %s. How can I help you with your crop?",
                all.size(), new DecimalFormat("#,##0.00").format(avg));
    }
}