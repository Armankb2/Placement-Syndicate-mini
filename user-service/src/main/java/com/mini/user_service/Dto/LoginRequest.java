package com.mini.user_service.Dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
