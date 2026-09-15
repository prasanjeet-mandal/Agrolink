package com.agrolink.dto.logistics;
import jakarta.validation.constraints.NotBlank;
public record LogisticsStatusRequest(@NotBlank String status){}
