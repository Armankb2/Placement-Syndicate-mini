package com.mini.mentorship_service.Controller;

import com.mini.mentorship_service.Dto.EnrollmentResponse;
import com.mini.mentorship_service.Dto.ProgramRequest;
import com.mini.mentorship_service.Dto.ProgramResponse;
import com.mini.mentorship_service.Service.MentorshipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentorship")
public class MentorshipController {

    @Autowired
    private MentorshipService mentorshipService;

    // ─── MENTOR ENDPOINTS ──────────────────────────────────────────

    @PostMapping("/programs")
    public ResponseEntity<?> createProgram(
            @Valid @RequestBody ProgramRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String mentorId = jwt.getSubject();
            String mentorName = jwt.getClaimAsString("name") != null
                    ? jwt.getClaimAsString("name")
                    : jwt.getSubject();
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(mentorshipService.createProgram(request, mentorId, mentorName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/programs/me")
    public ResponseEntity<List<ProgramResponse>> getMyPrograms(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(mentorshipService.getMyPrograms(jwt.getSubject()));
    }

    @GetMapping("/programs/{programId}/students")
    public ResponseEntity<?> getEnrolledStudents(
            @PathVariable String programId,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            return ResponseEntity.ok(mentorshipService.getEnrolledStudents(programId, jwt.getSubject()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── STUDENT ENDPOINTS ─────────────────────────────────────────

    @GetMapping("/programs")
    public ResponseEntity<List<ProgramResponse>> getAllPrograms() {
        return ResponseEntity.ok(mentorshipService.getAllPrograms());
    }

    @PostMapping("/programs/{programId}/enroll")
    public ResponseEntity<?> enrollInProgram(
            @PathVariable String programId,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            String studentId = jwt.getSubject();
            String studentName = jwt.getClaimAsString("name") != null
                    ? jwt.getClaimAsString("name")
                    : jwt.getSubject();
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(mentorshipService.enrollInProgram(programId, studentId, studentName));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/enrollments/me")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(mentorshipService.getMyEnrollments(jwt.getSubject()));
    }
}
