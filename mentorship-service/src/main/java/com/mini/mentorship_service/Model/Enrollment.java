package com.mini.mentorship_service.Model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "enrollments")
public class Enrollment {

    @Id
    private String id;

    private String programId;
    private String programTitle;

    private String studentId;
    private String studentName;

    @CreatedDate
    private LocalDateTime enrolledDate;
}
