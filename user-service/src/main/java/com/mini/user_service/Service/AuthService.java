package com.mini.user_service.Service;

import com.mini.user_service.Dto.AuthResponse;
import com.mini.user_service.Dto.LoginRequest;
import com.mini.user_service.Dto.RegisterRequest;
import com.mini.user_service.Dto.UserResponse;
import com.mini.user_service.Model.User;
import com.mini.user_service.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserService userService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    public AuthResponse signup(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with same email already present");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setYear(request.getYear());

        if (request.getAdminCode() != null && "ADMIN_SYNDICATE_2026".equals(request.getAdminCode())) {
            user.setRole(com.mini.user_service.Model.UserRole.ADMIN);
        } else if (request.getRole() != null) {
            try {
                user.setRole(com.mini.user_service.Model.UserRole.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(com.mini.user_service.Model.UserRole.STUDENT);
            }
        } else {
            user.setRole(com.mini.user_service.Model.UserRole.STUDENT);
        }

        User savedUser = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(savedUser), userService.mapToResponse(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return new AuthResponse(jwtService.generateToken(user), userService.mapToResponse(user));
    }
}
