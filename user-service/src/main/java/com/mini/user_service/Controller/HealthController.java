package com.mini.user_service.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping(value = "/ping", produces = "application/json")
    public String ping() {
        return "{\"status\": \"pong\"}";
    }

    @GetMapping(value = "/", produces = "application/json")
    public String root() {
        return "{\"status\": \"UP\", \"service\": \"user-service\"}";
    }
}
