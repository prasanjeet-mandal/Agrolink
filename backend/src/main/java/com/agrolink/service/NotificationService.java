package com.agrolink.service;
import com.agrolink.dto.notification.NotificationResponse;
import java.util.List;
public interface NotificationService { List<NotificationResponse> mine(String email); NotificationResponse markRead(String email,Long id); void create(String email,String title,String message,String type); }
