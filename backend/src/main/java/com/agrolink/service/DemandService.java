package com.agrolink.service;

import com.agrolink.dto.demand.DemandForecastResponse;
import com.agrolink.dto.demand.DemandListResponse;

public interface DemandService {

    DemandListResponse forecasts();

    DemandForecastResponse forecastFor(Long productId);
}