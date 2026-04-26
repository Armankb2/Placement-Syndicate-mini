package com.mini.user_service.Service;

import com.mini.user_service.Dto.RegisterRequest;
import com.mini.user_service.Dto.UserResponse;
import com.mini.user_service.Model.User;
import com.mini.user_service.Repository.UserRepository;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public UserResponse getOrCreateUser(Jwt jwt) {

        String keycloakId = jwt.getSubject();

        Optional<User> existingUser = userRepository.findByKeyCloakId(keycloakId);

        if (existingUser.isPresent()) {
            return mapToResponse(existingUser.get());
        }

        User newUser = new User();
        newUser.setKeyCloakId(keycloakId);
        newUser.setEmail(jwt.getClaim("email"));
        newUser.setFirstname(jwt.getClaim("given_name"));
        newUser.setLastname(jwt.getClaim("family_name"));
        newUser.setYear(1); // default year

        User savedUser = userRepository.save(newUser);

        return mapToResponse(savedUser);
    }


    public UserResponse getUserProfile(String id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToResponse(user);
    }

    //  Optional: Manual register (can remove if using only Google)
    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with same email already present");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setYear(request.getYear());

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }


    private UserResponse mapToResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstname(user.getFirstname());
        response.setLastname(user.getLastname());
        response.setKeyCloakId(user.getKeyCloakId());
        response.setRole(user.getRole() != null ? user.getRole().name() : null);

        return response;
    }
}