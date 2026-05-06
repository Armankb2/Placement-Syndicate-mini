package com.mini.mentorship_service.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import java.util.List;

public class ProgramRequest {
    @NotBlank(message = "Domain is required")
    private String domain;
    @NotBlank(message = "Description is required")
    private String description;
    private Map<String, List<String>> availability;
    @Min(value = 1, message = "Max students must be at least 1")
    private int maxStudents;

    // Getters and Setters
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Map<String, List<String>> getAvailability() { return availability; }
    public void setAvailability(Map<String, List<String>> availability) { this.availability = availability; }
    public int getMaxStudents() { return maxStudents; }
    public void setMaxStudents(int maxStudents) { this.maxStudents = maxStudents; }
}
