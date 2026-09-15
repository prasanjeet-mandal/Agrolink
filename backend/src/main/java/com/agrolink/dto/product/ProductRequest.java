package com.agrolink.dto.product;
import jakarta.validation.constraints.*; import java.math.BigDecimal;
public record ProductRequest(@NotBlank String name,String description,@NotNull @Positive BigDecimal price,@NotBlank String unit,@NotNull @Positive Double availableQuantity,String imageUrl,String location,@NotNull Long categoryId){}
