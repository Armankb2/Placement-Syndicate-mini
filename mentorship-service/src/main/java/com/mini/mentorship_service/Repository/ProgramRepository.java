package com.mini.mentorship_service.Repository;

import com.mini.mentorship_service.Model.Program;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProgramRepository extends MongoRepository<Program, String> {
    List<Program> findByMentorId(String mentorId);
}
