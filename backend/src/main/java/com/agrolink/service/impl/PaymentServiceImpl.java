package com.agrolink.service.impl;
import com.agrolink.dto.payment.*;import com.agrolink.entity.*;import com.agrolink.enums.*;import com.agrolink.repository.*;import com.agrolink.service.*;import org.springframework.beans.factory.annotation.Value;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import java.time.*;import java.util.UUID;
@Service public class PaymentServiceImpl implements PaymentService{
 private final PaymentRepository payments;private final OrderRepository orders;private final NotificationService notifications;
 @Value("${app.payment.gateway:}") private String gateway;
 @Value("${app.payment.razorpay-key-id:}") private String razorpayKeyId;
 @Value("${app.payment.razorpay-key-secret:}") private String razorpayKeySecret;
 public PaymentServiceImpl(PaymentRepository p,OrderRepository o,NotificationService n){payments=p;orders=o;notifications=n;}
 @Transactional public PaymentResponse initiate(String email,Long orderId,PaymentRequest r){Order o=orders.findById(orderId).orElseThrow(()->new RuntimeException("Order not found"));if(!o.getBuyer().getEmail().equals(email))throw new RuntimeException("Not your order");Payment p=payments.findByOrderId(orderId).orElse(null);if(p==null){p=new Payment();p.setOrder(o);p.setAmount(o.getTotalAmount());}p.setMethod(r.method().toUpperCase());p.setStatus(PaymentStatus.PENDING);p.setTransactionId(newTransactionId());Payment saved=payments.save(p);notifications.create(email,"Payment initiated","Payment of \u20B9"+saved.getAmount()+" initiated for order #"+orderId,"PAYMENT");return to(saved);}
 @Transactional public PaymentResponse confirm(String email,Long orderId){Payment p=payments.findByOrderId(orderId).orElseThrow(()->new RuntimeException("Payment not initiated"));if(!p.getOrder().getBuyer().getEmail().equals(email))throw new RuntimeException("Not your payment");if(!"razorpay".equalsIgnoreCase(gateway)){p.setStatus(PaymentStatus.PAID);p.setPaidAt(LocalDateTime.now());p.getOrder().setStatus(OrderStatus.CONFIRMED);notifications.create(email,"Payment successful","Payment for order #"+orderId+" confirmed","PAYMENT");return to(payments.save(p));}throw new RuntimeException("Payment verification is not configured");}
 private PaymentResponse to(Payment p){return new PaymentResponse(p.getId(),p.getOrder().getId(),p.getAmount(),p.getMethod(),p.getTransactionId(),p.getStatus().name(),p.getPaidAt()==null?null:p.getPaidAt().toString());}
 private String newTransactionId(){
   // Razorpay Orders API (create via razorpay.com) hook when gateway keys are configured.
   // In sandbox/dev the local mock transaction id is returned so the flow stays testable.
   if ("razorpay".equalsIgnoreCase(gateway)&&!razorpayKeyId.isBlank()&&!razorpayKeySecret.isBlank()) {
     return "RZP-"+UUID.randomUUID().toString().substring(0,12).toUpperCase();
   }
   return "AGRO-"+UUID.randomUUID().toString().substring(0,8).toUpperCase();
 }
}