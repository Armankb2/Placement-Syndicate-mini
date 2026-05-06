package com.mini.user_service.Controller;

import com.mini.user_service.Dto.RegisterRequest;
import com.mini.user_service.Dto.UserResponse;
import com.mini.user_service.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
     * The API Gateway validates the JWT and injects X-User-Id into the request headers
     * before forwarding here — so we just read that header.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(
            @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
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
