package com.agrolink.entity;
import com.agrolink.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
@Entity @Table(name="notifications")
@Getter @Setter @NoArgsConstructor
public class Notification extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
    @Column(nullable=false) private String title;
    @Column(nullable=false,length=2000) private String message;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private NotificationType type=NotificationType.SYSTEM;
    @Column(nullable=false) private boolean readFlag=false;
}
