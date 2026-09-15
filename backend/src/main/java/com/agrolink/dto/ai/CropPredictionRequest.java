package com.agrolink.dto.ai;
import jakarta.validation.constraints.*;
public record CropPredictionRequest(@NotBlank String soilType,@NotBlank String season,@Positive double landArea,@Positive double rainfallMm){}
