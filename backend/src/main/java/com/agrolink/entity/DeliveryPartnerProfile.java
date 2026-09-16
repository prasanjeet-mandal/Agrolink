package com.agrolink.entity;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
@Entity @Table(name="delivery_partner_profiles")
@Getter @Setter @NoArgsConstructor
public class DeliveryPartnerProfile extends BaseEntity {
    @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id", nullable=false, unique=true)
    private User user;
    @Column(nullable=false) private String vehicleNumber;
    @Column(nullable=false) private String drivingLicense;
}