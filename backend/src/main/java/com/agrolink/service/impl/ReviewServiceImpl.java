package com.agrolink.service.impl;
import com.agrolink.dto.review.*;import com.agrolink.entity.*;import com.agrolink.enums.*;import com.agrolink.repository.*;import com.agrolink.service.ReviewService;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import java.util.*;
@Service public class ReviewServiceImpl implements ReviewService{
 private final ReviewRepository reviews;private final ProductRepository products;private final UserRepository users;
 public ReviewServiceImpl(ReviewRepository r,ProductRepository p,UserRepository u){reviews=r;products=p;users=u;}
 @Transactional public ReviewResponse create(String e,ReviewRequest r){if(reviews.existsByBuyerEmailAndProductId(e,r.productId()))throw new RuntimeException("You already reviewed this product");Review x=new Review();x.setBuyer(users.findByEmail(e).orElseThrow());x.setProduct(products.findById(r.productId()).orElseThrow(()->new RuntimeException("Product not found")));x.setRating(r.rating());x.setComment(r.comment());x.setStatus(ReviewStatus.APPROVED);return to(reviews.save(x));}
 public List<ReviewResponse> productReviews(Long id){return reviews.findByProductIdAndStatus(id,ReviewStatus.APPROVED).stream().map(this::to).toList();}
 @Transactional public ReviewResponse moderate(Long id,String s){Review x=reviews.findById(id).orElseThrow(()->new RuntimeException("Review not found"));x.setStatus(ReviewStatus.valueOf(s.toUpperCase()));return to(reviews.save(x));}
 private ReviewResponse to(Review x){return new ReviewResponse(x.getId(),x.getProduct().getId(),x.getProduct().getName(),x.getBuyer().getFullName(),x.getRating(),x.getComment(),x.getStatus().name());}
}
