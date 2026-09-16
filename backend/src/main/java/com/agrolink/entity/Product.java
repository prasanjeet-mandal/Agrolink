package com.agrolink.entity;
import com.agrolink.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
import java.math.BigDecimal;
@Entity @Table(name="products")
@Getter @Setter @NoArgsConstructor
public class Product extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="seller_id",nullable=false) private User seller;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="category_id",nullable=false) private Category category;
    @Version private Long version;
    @Column(nullable=false) private String name;
    @Column(length=2000) private String description;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal price;
    @Column(nullable=false) private String unit;
    @Column(nullable=false) private Double availableQuantity;
    private String imageUrl;
    private String location;
    private Double latitude;
    private Double longitude;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ProductStatus status=ProductStatus.ACTIVE;
}
