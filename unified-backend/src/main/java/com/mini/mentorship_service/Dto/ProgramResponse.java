package com.mini.mentorship_service.Dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

public class ProgramResponse {
    private String id;
    private String domain;
    private String description;
    private Map<String, List<String>> availability;
    private int maxStudents;
    private int enrolledCount;
    private String mentorId;
    private String mentorName;
    private LocalDateTime createdDate;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Map<String, List<String>> getAvailability() { return availability; }
    public void setAvailability(Map<String, List<String>> availability) { this.availability = availability; }
    public int getMaxStudents() { return maxStudents; }
    public void setMaxStudents(int maxStudents) { this.maxStudents = maxStudents; }
    public int getEnrolledCount() { return enrolledCount; }
    public void setEnrolledCount(int enrolledCount) { this.enrolledCount = enrolledCount; }
    public String getMentorId() { return mentorId; }
    public void setMentorId(String mentorId) { this.mentorId = mentorId; }
    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
