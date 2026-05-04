package com.mini.mentorship_service.Service;

import com.mini.mentorship_service.Dto.EnrollmentResponse;
import com.mini.mentorship_service.Dto.ProgramRequest;
import com.mini.mentorship_service.Dto.ProgramResponse;
import com.mini.mentorship_service.Model.Enrollment;
import com.mini.mentorship_service.Model.Program;
import com.mini.mentorship_service.Repository.EnrollmentRepository;
import com.mini.mentorship_service.Repository.ProgramRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MentorshipService {

    private static final Logger logger = LoggerFactory.getLogger(MentorshipService.class);

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    // ─── MENTOR: Create Program ────────────────────────────────────
    public ProgramResponse createProgram(ProgramRequest request, String mentorId, String mentorName) {
        logger.info("Creating program '{}' by mentor '{}'", request.getTitle(), mentorName);
        Program program = new Program();
        program.setTitle(request.getTitle());
        program.setDescription(request.getDescription());
        program.setDate(request.getDate());
        program.setTime(request.getTime());
        program.setDuration(request.getDuration());
        program.setMaxStudents(request.getMaxStudents());
        program.setEnrolledCount(0);
        program.setMentorId(mentorId);
        program.setMentorName(mentorName);
        Program saved = programRepository.save(program);
        logger.info("Program created with id={}", saved.getId());
        return mapToResponse(saved);
    }

    // ─── MENTOR: Get My Programs ───────────────────────────────────
    public List<ProgramResponse> getMyPrograms(String mentorId) {
        List<Program> programs = programRepository.findByMentorId(mentorId);
        List<ProgramResponse> responses = new ArrayList<>();
        for (Program p : programs) { responses.add(mapToResponse(p)); }
        return responses;
    }

    // ─── MENTOR: Get Enrolled Students ─────────────────────────────
    public List<EnrollmentResponse> getEnrolledStudents(String programId, String mentorId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found"));
        if (!program.getMentorId().equals(mentorId)) {
            throw new RuntimeException("You are not the mentor of this program");
        }
        List<Enrollment> enrollments = enrollmentRepository.findByProgramId(programId);
        List<EnrollmentResponse> responses = new ArrayList<>();
        for (Enrollment e : enrollments) { responses.add(mapToEnrollmentResponse(e)); }
        return responses;
    }

    // ─── STUDENT: Get All Programs ─────────────────────────────────
    public List<ProgramResponse> getAllPrograms() {
        List<Program> programs = programRepository.findAll();
        List<ProgramResponse> responses = new ArrayList<>();
        for (Program p : programs) { responses.add(mapToResponse(p)); }
        return responses;
    }

    // ─── STUDENT: Enroll in Program ────────────────────────────────
    public EnrollmentResponse enrollInProgram(String programId, String studentId, String studentName) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found"));

        // Prevent duplicate enrollment
        Optional<Enrollment> existing = enrollmentRepository.findByProgramIdAndStudentId(programId, studentId);
        if (existing.isPresent()) {
            throw new RuntimeException("You are already enrolled in this program");
        }

        // Respect max student limit
        if (program.getEnrolledCount() >= program.getMaxStudents()) {
            throw new RuntimeException("This program is full. Maximum " + program.getMaxStudents() + " students allowed");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setProgramId(programId);
        enrollment.setProgramTitle(program.getTitle());
        enrollment.setStudentId(studentId);
        enrollment.setStudentName(studentName);
        Enrollment saved = enrollmentRepository.save(enrollment);

        program.setEnrolledCount(program.getEnrolledCount() + 1);
        programRepository.save(program);

        logger.info("Student '{}' enrolled in program '{}'", studentName, program.getTitle());
        return mapToEnrollmentResponse(saved);
    }

    // ─── STUDENT: Get My Enrollments ───────────────────────────────
    public List<EnrollmentResponse> getMyEnrollments(String studentId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<EnrollmentResponse> responses = new ArrayList<>();
        for (Enrollment e : enrollments) { responses.add(mapToEnrollmentResponse(e)); }
        return responses;
    }

    // ─── Mappers ───────────────────────────────────────────────────
    private ProgramResponse mapToResponse(Program p) {
        ProgramResponse r = new ProgramResponse();
        r.setId(p.getId()); r.setTitle(p.getTitle()); r.setDescription(p.getDescription());
        r.setDate(p.getDate()); r.setTime(p.getTime()); r.setDuration(p.getDuration());
        r.setMaxStudents(p.getMaxStudents()); r.setEnrolledCount(p.getEnrolledCount());
        r.setMentorId(p.getMentorId()); r.setMentorName(p.getMentorName());
        r.setCreatedDate(p.getCreatedDate());
        return r;
    }

    private EnrollmentResponse mapToEnrollmentResponse(Enrollment e) {
        EnrollmentResponse r = new EnrollmentResponse();
        r.setId(e.getId()); r.setProgramId(e.getProgramId()); r.setProgramTitle(e.getProgramTitle());
        r.setStudentId(e.getStudentId()); r.setStudentName(e.getStudentName());
        r.setEnrolledDate(e.getEnrolledDate());
        return r;
    }
}
