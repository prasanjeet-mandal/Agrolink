package com.agrolink.dto.order;
import java.math.BigDecimal;
public record OrderItemResponse(Long productId,String productName,Double quantity,BigDecimal unitPrice,BigDecimal lineTotal,String unit){}