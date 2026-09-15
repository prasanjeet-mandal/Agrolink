package com.agrolink.dto.ai;
public record DemandPredictionResponse(String productName,double predictedWeeklyDemand,double reorderQuantity,String recommendation){}
