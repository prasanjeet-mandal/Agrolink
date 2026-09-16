package com.agrolink.repository;
import com.agrolink.entity.Notification; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface NotificationRepository extends JpaRepository<Notification,Long>{ List<Notification> findByUserEmailOrderByCreatedAtDesc(String email); Optional<Notification> findByIdAndUserEmail(Long id,String email); }
