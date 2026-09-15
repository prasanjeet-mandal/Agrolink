package com.agrolink.entity;
import com.agrolink.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
@Entity @Table(name="reviews", uniqueConstraints=@UniqueConstraint(columnNames={"buyer_id","product_id"}))
@Getter @Setter @NoArgsConstructor
public class Review extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="buyer_id",nullable=false) private User buyer;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="product_id",nullable=false) private Product product;
    @Column(nullable=false) private Integer rating;
    @Column(length=1000) private String comment;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ReviewStatus status=ReviewStatus.PENDING;
}
