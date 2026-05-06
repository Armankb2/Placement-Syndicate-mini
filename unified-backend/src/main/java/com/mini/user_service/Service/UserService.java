package com.mini.user_service.Service;

import com.mini.user_service.Dto.RegisterRequest;
import com.mini.user_service.Dto.UserResponse;
import com.mini.user_service.Model.User;
import com.mini.user_service.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Fetches a user by their internal UUID (set as the JWT `sub` claim).
     * Called by UserController /me after the gateway injects X-User-Id.
     */
    public UserResponse getUserProfile(String id) {
        User user = userRepository.findById(id)
                .or(() -> userRepository.findByKeyCloakId(id))
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return mapToResponse(user);
    }

    /**
     * Legacy /register endpoint (kept for compatibility).
     * New signups should go through AuthService → POST /api/auth/signup.
     */
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with same email already present");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setYear(request.getYear());

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstname(user.getFirstname());
        response.setLastname(user.getLastname());
        response.setRole(user.getRole() != null ? user.getRole().name() : null);
        return response;
    }
}
