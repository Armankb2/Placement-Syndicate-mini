package com.mini.mentorship_service.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramResponse {

    private String id;
    private String domain;
    private String description;
    private java.util.Map<String, java.util.List<String>> availability;
    private int maxStudents;
    private int enrolledCount;
    private String mentorId;
    private String mentorName;
    private LocalDateTime createdDate;
}
