package com.mini.notification_service.dto;

import java.util.List;

public class SendNewExperienceRequest {
    private String companyName;
    private List<UserDto> users;

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public List<UserDto> getUsers() { return users; }
    public void setUsers(List<UserDto> users) { this.users = users; }

    public static class UserDto {
        private String id;
        private String email;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
