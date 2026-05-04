package com.mini.mentorship_service.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentResponse {

    private String id;
    private String programId;
    private String programTitle;
    private String studentId;
    private String studentName;
    private LocalDateTime enrolledDate;
}
