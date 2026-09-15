package com.agrolink.dto.ai;
import jakarta.validation.constraints.*;
public record YieldPredictionRequest(@NotBlank String crop,@Positive double landArea,@Positive double rainfallMm,@Positive double fertilizerKgPerAcre){}
