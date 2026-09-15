package com.agrolink.dto.ai;
import jakarta.validation.constraints.*; 
public record DemandPredictionRequest(@NotBlank String productName,@Positive double currentStock,@Positive double historicalWeeklySales,@Positive double seasonalFactor){}
