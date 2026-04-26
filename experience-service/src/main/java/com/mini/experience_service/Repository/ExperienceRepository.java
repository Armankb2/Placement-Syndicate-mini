package com.mini.experience_service.Repository;

import com.mini.experience_service.Model.Experience;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExperienceRepository extends MongoRepository<Experience, String> {

    List<Experience> findByCompanyName(String companyName);
    List<Experience> findByCreatedBy(String createdBy);
}
