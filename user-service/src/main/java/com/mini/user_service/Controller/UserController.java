package com.mini.user_service.Controller;

import com.mini.user_service.Dto.RegisterRequest;
import com.mini.user_service.Dto.UserResponse;
import com.mini.user_service.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import jakarta.validation.Valid;
import java.util.List;


@RestController
@RequestMapping("/api/users")
public class UserController {

        @Autowired
        private UserService userService;

        @GetMapping("/me")
        public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {

                Jwt jwt = (Jwt) authentication.getPrincipal();

                return ResponseEntity.ok(userService.getOrCreateUser(jwt));

        }


        @GetMapping("/{userid}")
        public ResponseEntity<UserResponse> getUser(@PathVariable String userid) {
            return ResponseEntity.ok(userService.getUserProfile(userid)) ;
        }

        @PostMapping("/register")
        public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request){
            return ResponseEntity.ok(userService.register(request));
        }

        @GetMapping("/all")
        public ResponseEntity<List<UserResponse>> getAllUsers() {
            return ResponseEntity.ok(userService.getAllUsers());
        }

//        @GetMapping("/{userid}/validate")
//        public ResponseEntity<Boolean> isUserPresent(@PathVariable String userid) {
//            return ResponseEntity.ok(userService.existsByUserId(userid)) ;
//        }
}
