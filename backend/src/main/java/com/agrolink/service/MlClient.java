package com.agrolink.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.temporal.IsoFields;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Thin client for the Python ai-service (FastAPI) ML models.
 * Endpoints consumed: /predict/price, /predict/demand, /predict/supply.
 * Returns empty when the service is unreachable so callers can fall back.
 */
@Component
public class MlClient {

    public record Base(String market, String category, String product) {
    }

    private final String url;
    private final RestClient client;
    private final ObjectMapper json = new ObjectMapper();
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MlClient.class);

    public MlClient(@Value("${app.ai.python-url:http://localhost:8000}") String url) {
        this.url = url;
        this.client = RestClient.create();
    }

    public Optional<Double> predictPrice(Base b, double modalPriceQtl, int month, double priceLag) {
        Map<String, Object> body = features(b, month);
        double lag = priceLag > 0 ? priceLag : modalPriceQtl;
        body.put("modal_price_rs_qtl", modalPriceQtl);
        body.put("min_price_rs_qtl", modalPriceQtl * 0.9);
        body.put("max_price_rs_qtl", modalPriceQtl * 1.1);
        body.put("price_range_rs_qtl", modalPriceQtl * 0.2);
        body.put("net_price_after_transport", modalPriceQtl);
        body.put("price_lag_1d", lag);
        body.put("price_lag_8d", lag);
        body.put("price_lag_28d", lag);
        body.put("price_rolling_7d", lag);
        body.put("price_rolling_28d", lag);
        return post("/predict/price", body, "predicted_price_rs_qtl");
    }

    public Optional<Double> predictDemand(Base b, double modalPriceQtl, int month, double demandTonnes) {
        Map<String, Object> body = features(b, month);
        double demand = demandTonnes > 0 ? demandTonnes : 25;
        body.put("modal_price_rs_qtl", modalPriceQtl);
        body.put("min_price_rs_qtl", modalPriceQtl * 0.9);
        body.put("max_price_rs_qtl", modalPriceQtl * 1.1);
        body.put("price_range_rs_qtl", modalPriceQtl * 0.2);
        body.put("net_price_after_transport", modalPriceQtl);
        body.put("demand_tonnes", demand);
        body.put("arrival_tonnes", demand * 0.95);
        body.put("supply_demand_ratio", 0.95);
        body.put("demand_index", 100.0);
        body.put("price_lag_1d", modalPriceQtl);
        body.put("price_lag_8d", modalPriceQtl);
        body.put("price_lag_28d", modalPriceQtl);
        body.put("price_rolling_7d", modalPriceQtl);
        body.put("price_rolling_28d", modalPriceQtl);
        body.put("demand_lag_1d", demand);
        body.put("demand_lag_8d", demand);
        body.put("demand_lag_28d", demand);
        body.put("demand_rolling_7d", demand);
        body.put("demand_rolling_28d", demand);
        body.put("arrival_lag_1d", demand * 0.95);
        body.put("arrival_lag_8d", demand * 0.95);
        body.put("arrival_lag_28d", demand * 0.95);
        body.put("arrival_rolling_7d", demand * 0.95);
        body.put("arrival_rolling_28d", demand * 0.95);
        return post("/predict/demand", body, "predicted_demand_tonnes");
    }

    public Optional<Double> predictSupply(Base b, double modalPriceQtl, int month, double demandTonnes) {
        Map<String, Object> body = features(b, month);
        double demand = demandTonnes > 0 ? demandTonnes : 25;
        body.put("modal_price_rs_qtl", modalPriceQtl);
        body.put("supply_demand_ratio", 1.0);
        body.put("demand_tonnes", demand);
        body.put("arrival_tonnes", demand * 1.0);
        body.put("arrival_lag_1d", demand);
        body.put("arrival_lag_8d", demand);
        body.put("arrival_lag_28d", demand);
        body.put("arrival_rolling_7d", demand);
        body.put("arrival_rolling_28d", demand);
        body.put("demand_lag_1d", demand);
        body.put("demand_lag_8d", demand);
        body.put("demand_lag_28d", demand);
        return post("/predict/supply", body, "predicted_supply_tonnes");
    }

    private Map<String, Object> features(Base b, int month) {
        Map<String, Object> f = new LinkedHashMap<>();
        LocalDate anchor = LocalDate.of(2026, Math.max(1, Math.min(12, month)), 1);
        int doy = anchor.getDayOfYear();
        double sin = Math.sin(2 * Math.PI * doy / 365.25);
        double cos = Math.cos(2 * Math.PI * doy / 365.25);

        f.put("market", b.market());
        f.put("category", b.category());
        f.put("product", b.product());
        f.put("arrival_tonnes", 20.0);
        f.put("demand_tonnes", 20.0);
        f.put("demand_index", 50.0);
        f.put("temperature_c", 25.0);
        f.put("humidity_pct", 60.0);
        f.put("rainfall_mm", 0.0);
        f.put("distance_from_roorkee_km", 20.0);
        f.put("road_quality_score", 0.8);
        f.put("travel_time_hr", 1.0);
        f.put("transport_cost_rs", 500.0);
        f.put("cold_chain_available", 0);
        f.put("quality_score", 0.8);
        f.put("moisture_pct", 10.0);
        f.put("festival_flag", 0);
        f.put("holiday_flag", 0);
        f.put("month", month);
        f.put("day_of_week", anchor.getDayOfWeek().getValue());
        f.put("week_of_year", anchor.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
        f.put("year", 2026);
        f.put("sin_doy", sin);
        f.put("cos_doy", cos);
        return f;
    }

    private Optional<Double> post(String path, Map<String, Object> body, String field) {
        try {
            String raw = client.post()
                    .uri(url + path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json.writeValueAsString(body))
                    .retrieve()
                    .body(String.class);
            JsonNode node = json.readTree(raw);
            JsonNode v = node.path(field);
            if (v.isNumber()) {
                return Optional.of(v.asDouble());
            }
            return Optional.empty();
        } catch (Exception e) {
            log.warn("ML {} failed: {}", path, e.toString());
            return Optional.empty();
        }
    }
}