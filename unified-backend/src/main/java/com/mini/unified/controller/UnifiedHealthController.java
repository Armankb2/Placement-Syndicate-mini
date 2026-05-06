package com.mini.unified.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

@RestController
public class UnifiedHealthController {

    @GetMapping("/api/ping")
    public Map<String, String> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Placement Syndicate Unified Backend is running");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return response;
    }

    @GetMapping("/")
    public String home() {
        return "Placement Syndicate API Gateway & Unified Backend is Online.";
    }
}
