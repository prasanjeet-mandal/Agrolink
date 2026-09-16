package com.agrolink.entity;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
@Entity @Table(name="cart_items", uniqueConstraints=@UniqueConstraint(columnNames={"cart_id","product_id"}))
@Getter @Setter @NoArgsConstructor
public class CartItem extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="cart_id",nullable=false) private Cart cart;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="product_id",nullable=false) private Product product;
    @Column(nullable=false) private Double quantity;
}
