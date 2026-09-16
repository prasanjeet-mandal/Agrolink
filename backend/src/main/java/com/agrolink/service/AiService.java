package com.agrolink.service;

import com.agrolink.dto.ai.*;

public interface AiService {

    CropPredictionResponse crop(CropPredictionRequest r);

    DemandPredictionResponse demand(DemandPredictionRequest r);

    YieldPredictionResponse yield(YieldPredictionRequest r);

    ChatResponse chat(ChatRequest r);
}