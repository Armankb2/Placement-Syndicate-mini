package com.mini.user_service.Controller;

import com.mini.user_service.Dto.RegisterRequest;
import com.mini.user_service.Dto.UserResponse;
import com.mini.user_service.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Returns the currently authenticated user's profile.
     * Resolves user ID from either X-User-Id header or the validated JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        String resolvedId = userId;
        if (resolvedId == null || resolvedId.isBlank()) {
            if (jwt != null) {
                resolvedId = jwt.getSubject();
            }
        }
        if (resolvedId == null || resolvedId.isBlank()) {
            throw new RuntimeException("Authenticated user id is missing");
        }
        return ResponseEntity.ok(userService.getUserProfile(resolvedId));
    }

    @GetMapping("/{userid}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String userid) {
        return ResponseEntity.ok(userService.getUserProfile(userid));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
