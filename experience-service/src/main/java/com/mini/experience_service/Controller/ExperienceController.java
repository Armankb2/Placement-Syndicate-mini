package com.mini.experience_service.Controller;

import com.mini.experience_service.Dto.RegisterRequest;
import com.mini.experience_service.Dto.UserResponse;
import com.mini.experience_service.Service.ExperienceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
            @AuthenticationPrincipal Jwt jwt
    ) {
        String keycloakId = jwt.getSubject();

        return ResponseEntity.ok(
                experienceService.register(request, keycloakId)
        );
    }

    @GetMapping("/companies")
    public ResponseEntity<List<String>> getAllCompanies(){
        return ResponseEntity.ok(experienceService.getAllCompanies());
    }

    @GetMapping("/company/{companyName}")
    public ResponseEntity<List<UserResponse>> getByCompanyName(@PathVariable String companyName){
        return ResponseEntity.ok(experienceService.getByCompanyName(companyName));
    }

    @GetMapping("/me")
    public ResponseEntity<List<UserResponse>> getMyExperiences(@AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        return ResponseEntity.ok(experienceService.getExperiencesByUser(keycloakId));
    }

    @DeleteMapping("/admin/{experienceId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> deleteExperienceByAdmin(@PathVariable("experienceId") String experienceId) {
        experienceService.deleteExperienceByAdmin(experienceId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/{experienceId}")
    public ResponseEntity<Void> deleteOwnExperience(@PathVariable("experienceId") String experienceId, @AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        experienceService.deleteOwnExperience(experienceId, keycloakId);
        return ResponseEntity.noContent().build();
    }
}
