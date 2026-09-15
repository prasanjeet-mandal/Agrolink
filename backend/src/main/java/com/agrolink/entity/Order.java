package com.agrolink.entity;
import com.agrolink.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
import java.math.BigDecimal; import java.util.*;
@Entity @Table(name="orders")
@Getter @Setter @NoArgsConstructor
public class Order extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="buyer_id",nullable=false) private User buyer;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="shipping_address_id") private Address shippingAddress;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status=OrderStatus.PLACED;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal totalAmount=BigDecimal.ZERO;
    @OneToMany(mappedBy="order",cascade=CascadeType.ALL,orphanRemoval=true) private List<OrderItem> items=new ArrayList<>();
}
