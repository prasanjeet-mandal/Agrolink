package com.agrolink.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle extends BaseEntity {

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, unique = true)
    private String plate;

    @Column(nullable = false)
    private String driverName;

    private String driverPhone;

    @Column(nullable = false)
    private String status = "AVAILABLE";
}