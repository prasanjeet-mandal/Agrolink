package com.agrolink.entity;
import com.agrolink.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
import java.math.BigDecimal; import java.time.LocalDateTime;
@Entity @Table(name="payments")
@Getter @Setter @NoArgsConstructor
public class Payment extends BaseEntity {
    @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="order_id",unique=true,nullable=false) private Order order;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal amount;
    @Column(nullable=false) private String method;
    @Column(unique=true) private String transactionId;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private PaymentStatus status=PaymentStatus.PENDING;
    private LocalDateTime paidAt;
}
