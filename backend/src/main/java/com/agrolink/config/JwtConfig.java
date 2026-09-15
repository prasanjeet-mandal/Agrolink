package com.agrolink.config;


import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig {

    private String secret;

    private long expiration;

    private long registrationExpiration;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpiration() {
        return expiration;
    }

    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }

    public long getRegistrationExpiration() {
        return registrationExpiration;
    }

    public void setRegistrationExpiration(long registrationExpiration) {
        this.registrationExpiration = registrationExpiration;
    }
}