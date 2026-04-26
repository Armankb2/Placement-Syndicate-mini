package com.mini.experience_service.Service;

import com.mini.experience_service.Dto.RegisterRequest;
import com.mini.experience_service.Dto.UserResponse;
import com.mini.experience_service.Model.Experience;
import com.mini.experience_service.Repository.ExperienceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExperienceService {

    private static final Logger logger = LoggerFactory.getLogger(ExperienceService.class);

    @Autowired
    ExperienceRepository experienceRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public UserResponse getUserProfile(String id){
        Experience experience = experienceRepository.findById(id).orElseThrow(()-> new RuntimeException("Experience not found"));
        UserResponse userResponse = new UserResponse();

        userResponse.setId(experience.getId());
        userResponse.setCreatedDate(experience.getCreatedDate());
        userResponse.setCompanyName(experience.getCompanyName());
        userResponse.setRole(experience.getRole());
        userResponse.setYear(experience.getYear());
        userResponse.setCreatedBy(experience.getCreatedBy());
        // Defensive copy to avoid sharing the same mutable list reference; keeps null if source is null
        userResponse.setRounds(experience.getRounds() == null ? null : new ArrayList<>(experience.getRounds()));


        return userResponse;

    }

    public UserResponse register(RegisterRequest registerRequest, String keycloakId){
        logger.info("Register called with companyName={}, role={}, roundsCount={}", registerRequest.getCompanyName(), registerRequest.getRole(), registerRequest.getRounds() == null ? 0 : registerRequest.getRounds().size());
        // Map request to entity
        Experience experience = new Experience();

        experience.setCompanyName(registerRequest.getCompanyName());
        experience.setRole(registerRequest.getRole());
        experience.setYear(registerRequest.getYear());
        experience.setCreatedBy(keycloakId);
        // defensive copy of rounds from request to avoid sharing mutable list
        experience.setRounds(registerRequest.getRounds() == null ? null : new ArrayList<>(registerRequest.getRounds()));
        experience.setQuetions(registerRequest.getQuetions());
        experience.setTips(registerRequest.getTips());
        experience.setDifficultyLevel(registerRequest.getDifficultyLevel());

        // persist
        Experience saved = experienceRepository.save(experience);
        logger.info("Experience saved with id={}", saved == null ? "null" : saved.getId());

        // map saved entity to response DTO
        UserResponse userResponse = new UserResponse();
        userResponse.setId(saved.getId());
        userResponse.setCompanyName(saved.getCompanyName());
        userResponse.setRole(saved.getRole());
        userResponse.setYear(saved.getYear());
        userResponse.setCreatedBy(saved.getCreatedBy());
        userResponse.setRounds(saved.getRounds() == null ? null : new ArrayList<>(saved.getRounds()));
        userResponse.setQuetions(saved.getQuetions());
        userResponse.setTips(saved.getTips());
        userResponse.setDifficultyLevel(saved.getDifficultyLevel());
        userResponse.setCreatedDate(saved.getCreatedDate());

        // send message to kafka
        kafkaTemplate.send("new-experiences", "New experience added for company: " + saved.getCompanyName());

        return userResponse;
    }

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<String> getAllCompanies() {
        // Null-safety in case MongoTemplate wasn't injected (helps in tests/early startup)
        if (mongoTemplate == null) {
            logger.warn("mongoTemplate not injected - returning empty company list");
            return new ArrayList<>();
        }

        return mongoTemplate.query(Experience.class)
                .distinct("companyName")
                .as(String.class)
                .all();
    }

    public List<UserResponse> getByCompanyName(String companyName) {
        List<Experience> experiences = experienceRepository.findByCompanyName(companyName);
        List<UserResponse> responses = new ArrayList<>();

        for (Experience exp : experiences) {
            UserResponse userResponse = new UserResponse();
            userResponse.setId(exp.getId());
            userResponse.setCompanyName(exp.getCompanyName());
            userResponse.setRole(exp.getRole());
            userResponse.setYear(exp.getYear());
            userResponse.setCreatedBy(exp.getCreatedBy());
            userResponse.setRounds(exp.getRounds() == null ? null : new ArrayList<>(exp.getRounds()));
            userResponse.setQuetions(exp.getQuetions());
            userResponse.setTips(exp.getTips());
            userResponse.setDifficultyLevel(exp.getDifficultyLevel());
            userResponse.setCreatedDate(exp.getCreatedDate());

            responses.add(userResponse);
        }

        return responses;
    }

    public void deleteExperienceByAdmin(String experienceId) {
        Experience experience = experienceRepository.findById(experienceId).orElseThrow(() -> new RuntimeException("Experience not found"));
        experienceRepository.delete(experience);
    }

    public void deleteOwnExperience(String experienceId, String keycloakId) {
        Experience experience = experienceRepository.findById(experienceId).orElseThrow(() -> new RuntimeException("Experience not found"));
        if (!experience.getCreatedBy().equals(keycloakId)) {
            throw new RuntimeException("You are not authorized to delete this experience");
        }
        experienceRepository.delete(experience);
    }

    public List<UserResponse> getExperiencesByUser(String keycloakId) {
        List<Experience> experiences = experienceRepository.findByCreatedBy(keycloakId);
        List<UserResponse> responses = new ArrayList<>();

        for (Experience exp : experiences) {
            UserResponse userResponse = new UserResponse();
            userResponse.setId(exp.getId());
            userResponse.setCompanyName(exp.getCompanyName());
            userResponse.setRole(exp.getRole());
            userResponse.setYear(exp.getYear());
            userResponse.setCreatedBy(exp.getCreatedBy());
            userResponse.setRounds(exp.getRounds() == null ? null : new ArrayList<>(exp.getRounds()));
            userResponse.setQuetions(exp.getQuetions());
            userResponse.setTips(exp.getTips());
            userResponse.setDifficultyLevel(exp.getDifficultyLevel());
            userResponse.setCreatedDate(exp.getCreatedDate());

            responses.add(userResponse);
        }

        return responses;
    }
}
