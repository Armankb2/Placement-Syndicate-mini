package com.mini.mentorship_service.Model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "programs")
public class Program {

    @Id
    private String id;

    private String domain;
    private String description;
    
    private java.util.Map<String, java.util.List<String>> availability; // Day -> List of time slots

    private int maxStudents;
    private int enrolledCount;

    private String mentorId;
    private String mentorName;

    @CreatedDate
    private LocalDateTime createdDate;
}
