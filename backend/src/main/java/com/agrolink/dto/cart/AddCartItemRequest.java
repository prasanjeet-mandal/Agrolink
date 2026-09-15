package com.agrolink.dto.cart;
import jakarta.validation.constraints.*;
public record AddCartItemRequest(@NotNull Long productId,@NotNull @Positive Double quantity){}
