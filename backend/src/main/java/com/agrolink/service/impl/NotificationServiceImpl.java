package com.agrolink.service.impl;
import com.agrolink.dto.notification.NotificationResponse; import com.agrolink.entity.*; import com.agrolink.enums.NotificationType; import com.agrolink.repository.*; import com.agrolink.service.NotificationService;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.*;
@Service public class NotificationServiceImpl implements NotificationService {
 private final NotificationRepository repo; private final UserRepository users;
 public NotificationServiceImpl(NotificationRepository repo,UserRepository users){this.repo=repo;this.users=users;}
 public List<NotificationResponse> mine(String email){return repo.findByUserEmailOrderByCreatedAtDesc(email).stream().map(this::to).toList();}
 @Transactional public NotificationResponse markRead(String email,Long id){Notification n=repo.findByIdAndUserEmail(id,email).orElseThrow(()->new RuntimeException("Notification not found"));n.setReadFlag(true);return to(repo.save(n));}
 @Transactional public void create(String email,String title,String message,String type){User u=users.findByEmail(email).orElseThrow();Notification n=new Notification();n.setUser(u);n.setTitle(title);n.setMessage(message);n.setType(NotificationType.valueOf(type));repo.save(n);}
 private NotificationResponse to(Notification n){return new NotificationResponse(n.getId(),n.getTitle(),n.getMessage(),n.getType().name(),n.isReadFlag());}
}
