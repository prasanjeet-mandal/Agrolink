package com.agrolink.service;

import com.agrolink.dto.pricing.*;

public interface PricingService {

    PriceForecastResponse forecast(Long productId);

    PriceCalculateResponse calculate(PriceCalculateRequest r);

    PriceTrendResponse trend();
}