package com.agrolink.dto.logistics;

import jakarta.validation.constraints.NotNull;

public record UpdateLocationRequest(@NotNull Double latitude, @NotNull Double longitude) {
}