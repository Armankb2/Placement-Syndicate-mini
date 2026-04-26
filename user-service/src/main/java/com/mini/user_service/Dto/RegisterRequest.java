package com.mini.user_service.Dto;

import lombok.Data;

@Data
public class RegisterRequest {

    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private Integer year;
}
