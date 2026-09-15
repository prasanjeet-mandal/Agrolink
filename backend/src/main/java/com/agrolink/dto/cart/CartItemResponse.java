package com.agrolink.dto.cart;
import java.math.BigDecimal;
public record CartItemResponse(Long itemId,Long productId,String productName,Double quantity,BigDecimal unitPrice,BigDecimal total){}
