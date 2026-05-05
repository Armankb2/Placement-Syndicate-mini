package com.mini.experience_service.Controller;

import com.mini.experience_service.Dto.RegisterRequest;
import com.mini.experience_service.Dto.UserResponse;
import com.mini.experience_service.Service.ExperienceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experience")

public class ExperienceController {

    @Autowired
    ExperienceService experienceService;

    @GetMapping("/{userid}")
    public ResponseEntity<UserResponse> getExperienceById(@PathVariable("userid") String userid) {
        return ResponseEntity.ok(experienceService.getUserProfile(userid));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String keycloakId = resolveUserId(jwt, userId);

        return ResponseEntity.ok(
                experienceService.register(request, keycloakId));
    }

    @GetMapping("/companies")
    public ResponseEntity<List<String>> getAllCompanies() {
        return ResponseEntity.ok(experienceService.getAllCompanies());
    }

    @GetMapping("/company/{companyName}")
    public ResponseEntity<List<UserResponse>> getByCompanyName(@PathVariable String companyName) {
        return ResponseEntity.ok(experienceService.getByCompanyName(companyName));
    }

    @GetMapping("/me")
    public ResponseEntity<List<UserResponse>> getMyExperiences(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String keycloakId = resolveUserId(jwt, userId);
        return ResponseEntity.ok(experienceService.getExperiencesByUser(keycloakId));
    }

    @DeleteMapping("/admin/{experienceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExperienceByAdmin(@PathVariable("experienceId") String experienceId) {
        experienceService.deleteExperienceByAdmin(experienceId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/{experienceId}")
    public ResponseEntity<Void> deleteOwnExperience(
            @PathVariable("experienceId") String experienceId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        String keycloakId = resolveUserId(jwt, userId);
        experienceService.deleteOwnExperience(experienceId, keycloakId);
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(Jwt jwt, String userId) {
        if (userId != null && !userId.isBlank()) {
            return userId;
        }
        if (jwt != null) {
            return jwt.getSubject();
        }
        throw new RuntimeException("Authenticated user id is missing");
    }
}
