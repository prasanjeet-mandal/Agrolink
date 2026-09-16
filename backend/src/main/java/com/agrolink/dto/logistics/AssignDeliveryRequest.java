package com.agrolink.dto.logistics;
import jakarta.validation.constraints.NotNull;
public record AssignDeliveryRequest(@NotNull Long deliveryPartnerId){}
