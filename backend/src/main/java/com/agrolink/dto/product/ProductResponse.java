package com.agrolink.dto.product;
import java.math.BigDecimal;
public record ProductResponse(Long id,Long sellerId,String sellerName,Long categoryId,String categoryName,String name,String description,BigDecimal price,String unit,Double availableQuantity,String imageUrl,String location,Double latitude,Double longitude,String status,String sellerRole){}