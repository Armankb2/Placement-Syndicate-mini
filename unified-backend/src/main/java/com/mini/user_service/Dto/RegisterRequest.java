package com.mini.user_service.Dto;

public class RegisterRequest {
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private Integer year;
    private String role;
    private String adminCode;
    private String usn;
    private String department;
    private String designation;

    // Getters and Setters
    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }
    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getAdminCode() { return adminCode; }
    public void setAdminCode(String adminCode) { this.adminCode = adminCode; }
    public String getUsn() { return usn; }
    public void setUsn(String usn) { this.usn = usn; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
}
