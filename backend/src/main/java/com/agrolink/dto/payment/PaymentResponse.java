package com.agrolink.dto.payment;
import java.math.BigDecimal;
public record PaymentResponse(Long id,Long orderId,BigDecimal amount,String method,String transactionId,String status,String paidAt){}
