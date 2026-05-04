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
    private String title;
    private String description;
    private String date;
    private String time;
    private String duration;
    private int maxStudents;
    private int enrolledCount;
    private String mentorId;
    private String mentorName;
    private LocalDateTime createdDate;
}
