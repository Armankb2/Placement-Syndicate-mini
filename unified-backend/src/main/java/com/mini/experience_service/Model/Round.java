package com.mini.experience_service.Model;

public class Round {
    private String roundName;
    private String description;

    public Round() {}
    public Round(String roundName, String description) {
        this.roundName = roundName;
        this.description = description;
    }

    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
