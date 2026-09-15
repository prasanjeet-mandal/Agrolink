package com.agrolink.entity;
import com.agrolink.enums.LogisticsStatus;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
@Entity @Table(name="logistics")
@Getter @Setter @NoArgsConstructor
public class Logistics extends BaseEntity {
    @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="order_id",unique=true,nullable=false) private Order order;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="delivery_partner_id") private User deliveryPartner;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private LogisticsStatus status=LogisticsStatus.CREATED;
    private String pickupLocation;
    private String deliveryLocation;
    private Double distanceKm;
    private Integer etaMinutes;
    private String routeSummary;
    private Double currentLatitude;
    private Double currentLongitude;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
}
