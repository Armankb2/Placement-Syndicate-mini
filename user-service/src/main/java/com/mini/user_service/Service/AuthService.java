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
    private final org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserService userService,
            org.springframework.kafka.core.KafkaTemplate<String, String> kafkaTemplate
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
        this.kafkaTemplate = kafkaTemplate;
    }

    public AuthResponse signup(RegisterRequest request) {
        // Email Validation
        String email = request.getEmail();
        if (!(email.endsWith("@gmail.com") || email.endsWith("@msrit.edu"))) {
            throw new RuntimeException("Only @gmail.com or @msrit.edu emails are allowed");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with same email already present");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setYear(request.getYear());

        // Role-Based Logic
        if (request.getAdminCode() != null && "ADMIN_SYNDICATE_2026".equals(request.getAdminCode())) {
            user.setRole(com.mini.user_service.Model.UserRole.ADMIN);
        } else if (request.getRole() != null) {
            try {
                com.mini.user_service.Model.UserRole role = com.mini.user_service.Model.UserRole.valueOf(request.getRole().toUpperCase());
                user.setRole(role);
                
                if (role == com.mini.user_service.Model.UserRole.STUDENT) {
                    user.setUsn(request.getUsn());
                } else if (role == com.mini.user_service.Model.UserRole.MENTOR || role == com.mini.user_service.Model.UserRole.TEACHER) {
                    user.setDepartment(request.getDepartment());
                    user.setDesignation(request.getDesignation());
                }
            } catch (IllegalArgumentException e) {
                user.setRole(com.mini.user_service.Model.UserRole.STUDENT);
                user.setUsn(request.getUsn());
            }
        } else {
            user.setRole(com.mini.user_service.Model.UserRole.STUDENT);
            user.setUsn(request.getUsn());
        }

        User savedUser = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(savedUser), userService.mapToResponse(savedUser));
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send OTP via Kafka
        String message = String.format("{\"email\": \"%s\", \"otp\": \"%s\", \"type\": \"OTP\"}", email, otp);
        kafkaTemplate.send("email-notifications", message);
        System.out.println("OTP sent to Kafka: " + otp);
    }

    public void verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp) || user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
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
