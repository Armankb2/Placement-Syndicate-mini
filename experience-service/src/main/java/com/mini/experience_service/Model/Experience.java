package com.mini.experience_service.Model;

import lombok.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "experience")
public class Experience {

    @Id
    private String id;

    private String companyName;
    private String role;
    private Integer year;
    private String createdBy;
    private List<Round> rounds;
    private String quetions;
    private String tips;
    private DifficultyLevel difficultyLevel;

    @CreatedDate
    private LocalDateTime createdDate;

}
