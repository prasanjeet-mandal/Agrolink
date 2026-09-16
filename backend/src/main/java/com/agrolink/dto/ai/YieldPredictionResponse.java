package com.agrolink.dto.ai;
public record YieldPredictionResponse(String crop,double yieldPerAcre,double totalExpectedYield,String unit,String explanation){}
