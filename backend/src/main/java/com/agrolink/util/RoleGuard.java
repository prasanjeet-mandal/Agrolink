package com.agrolink.util;

import com.agrolink.enums.Role;

import java.util.EnumSet;

import static com.agrolink.enums.Role.BUYER;
import static com.agrolink.enums.Role.CONSUMER;
import static com.agrolink.enums.Role.DELIVERY_PARTNER;
import static com.agrolink.enums.Role.FARMER;
import static com.agrolink.enums.Role.FPO;

public final class RoleGuard {

    private static final EnumSet<Role> REGISTRABLE = EnumSet.of(
            BUYER, CONSUMER, FARMER, FPO, DELIVERY_PARTNER
    );

    private RoleGuard() {
    }

    public static boolean isRegistrable(Role role) {

        return role != null && REGISTRABLE.contains(role);
    }
}