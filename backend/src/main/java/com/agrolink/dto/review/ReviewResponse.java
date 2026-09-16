package com.agrolink.dto.review;
public record ReviewResponse(Long id,Long productId,String productName,String buyerName,Integer rating,String comment,String status){}
