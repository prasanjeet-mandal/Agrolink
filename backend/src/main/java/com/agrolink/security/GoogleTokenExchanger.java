package com.agrolink.security;

public interface GoogleTokenExchanger {

    String exchangeForIdToken(String authorizationCode);
}