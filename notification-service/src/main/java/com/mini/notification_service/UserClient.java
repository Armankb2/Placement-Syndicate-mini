package com.mini.notification_service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class UserClient {

    private final RestTemplate restTemplate;

    public UserClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<User> getAllUsers() {
        User[] users = restTemplate.getForObject("http://USER-SERVICE/api/users/all", User[].class);
        if (users == null) {
            return Collections.emptyList();
        }
        return Arrays.asList(users);
    }
}

