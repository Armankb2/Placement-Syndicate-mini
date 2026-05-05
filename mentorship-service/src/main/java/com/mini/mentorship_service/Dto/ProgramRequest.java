package com.mini.mentorship_service.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgramRequest {

    @NotBlank(message = "Domain is required")
    private String domain;

    @NotBlank(message = "Description is required")
    private String description;

    private java.util.Map<String, java.util.List<String>> availability;

    @Min(value = 1, message = "Max students must be at least 1")
    private int maxStudents;
}
