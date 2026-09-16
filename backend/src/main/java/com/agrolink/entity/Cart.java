package com.agrolink.entity;
import com.agrolink.enums.CartStatus;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
@Entity @Table(name="carts")
@Getter @Setter @NoArgsConstructor
public class Cart extends BaseEntity {
    @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id",unique=true,nullable=false) private User user;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private CartStatus status=CartStatus.ACTIVE;
}
