package com.mini.user_service.Dto;

import lombok.Data;

@Data
public class UserResponse {

    private String id;
    private String firstname;
    private String lastname;
    private String email;
    private String role;
    private String keyCloakId;
    private String createdDate;
    private String password;
}
