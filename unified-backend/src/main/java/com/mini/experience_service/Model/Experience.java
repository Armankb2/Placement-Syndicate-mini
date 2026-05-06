package com.mini.experience_service.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDateTime;
import java.util.List;

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

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public List<Round> getRounds() { return rounds; }
    public void setRounds(List<Round> rounds) { this.rounds = rounds; }
    public String getQuetions() { return quetions; }
    public void setQuetions(String quetions) { this.quetions = quetions; }
    public String getTips() { return tips; }
    public void setTips(String tips) { this.tips = tips; }
    public DifficultyLevel getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(DifficultyLevel difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
