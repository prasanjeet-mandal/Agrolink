package com.agrolink.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "image")
public class ImageConfig {

    private String cseKey = "";

    private String cseCx = "";

    public String getCseKey() {
        return cseKey;
    }

    public void setCseKey(String cseKey) {
        this.cseKey = cseKey;
    }

    public String getCseCx() {
        return cseCx;
    }

    public void setCseCx(String cseCx) {
        this.cseCx = cseCx;
    }

    public boolean isConfigured() {
        return !cseKey.isBlank() && !cseCx.isBlank();
    }
}