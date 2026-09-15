package com.agrolink.dto.demand;

import java.util.List;

public record DemandListResponse(
        List<DemandForecastResponse> forecasts
) {
}