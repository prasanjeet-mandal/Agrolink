package com.agrolink.dto.ai;
public record CropPredictionResponse(String crop,double confidence,String explanation,double expectedYieldPerAcre){}
