package com.agrolink.entity;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
@Entity @Table(name="categories", uniqueConstraints=@UniqueConstraint(columnNames="name"))
@Getter @Setter @NoArgsConstructor
public class Category extends BaseEntity {
    @Column(nullable=false, unique=true) private String name;
    private String description;
}
