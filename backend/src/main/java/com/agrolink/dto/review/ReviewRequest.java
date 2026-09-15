package com.agrolink.dto.review;
import jakarta.validation.constraints.*;
public record ReviewRequest(@NotNull Long productId,@NotNull @Min(1) @Max(5) Integer rating,String comment){}
