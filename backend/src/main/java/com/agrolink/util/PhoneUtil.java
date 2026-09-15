package com.agrolink.util;

import java.util.regex.Pattern;

public final class PhoneUtil {

    private static final Pattern E164 = Pattern.compile("^\\+[1-9][0-9]{1,14}$");

    private PhoneUtil() {
    }

    public static boolean isValidE164(String phone) {

        return phone != null && E164.matcher(phone).matches();
    }
}