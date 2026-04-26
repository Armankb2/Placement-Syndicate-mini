package com.mini.experience_service.Dto;

import com.mini.experience_service.Model.DifficultyLevel;
import com.mini.experience_service.Model.Round;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    private String companyName;
    private String role;
    private Integer year;
    private String createdBy;
    private List<Round> rounds;
    private String quetions;
    private String tips;
    private DifficultyLevel difficultyLevel;
}
