package com.mini.mentorship_service.Repository;

import com.mini.mentorship_service.Model.Enrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends MongoRepository<Enrollment, String> {
    List<Enrollment> findByStudentId(String studentId);
    List<Enrollment> findByProgramId(String programId);
    Optional<Enrollment> findByProgramIdAndStudentId(String programId, String studentId);
}
