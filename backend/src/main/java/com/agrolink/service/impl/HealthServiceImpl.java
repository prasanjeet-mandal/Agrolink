package com.agrolink.service.impl;

import com.agrolink.service.HealthService;
import org.springframework.stereotype.Service;

@Service
public class HealthServiceImpl implements HealthService {

    @Override
    public String checkHealth() {

        return "OK";
    }
}