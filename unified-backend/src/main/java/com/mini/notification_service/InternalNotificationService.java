package com.mini.notification_service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class InternalNotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(InternalNotificationService.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final com.mini.user_service.Service.UserService userService;

    @Value("${app.notification-service.url}")
    private String notificationServiceUrl;

    public InternalNotificationService(com.mini.user_service.Service.UserService userService) {
        this.userService = userService;
    }

    @Async
    public void sendNewExperienceNotification(String companyName) {
        LOGGER.info("#### -> Forwarding new experience notification for -> {} to {}", companyName, notificationServiceUrl);
        try {
            List<com.mini.user_service.Dto.UserResponse> users = userService.getAllUsers();
            List<Map<String, String>> userDtos = new ArrayList<>();
            for (com.mini.user_service.Dto.UserResponse user : users) {
                Map<String, String> u = new HashMap<>();
                u.put("id", user.getId());
                u.put("email", user.getEmail());
                userDtos.add(u);
            }

            Map<String, Object> request = new HashMap<>();
            request.put("companyName", companyName);
            request.put("users", userDtos);

            restTemplate.postForObject(notificationServiceUrl + "/api/notifications/send-experience", request, Void.class);
        } catch (Exception e) {
            LOGGER.error("Failed to forward new experience notification: {}", e.getMessage());
        }
    }

    @Async
    public void sendOtpNotification(String email, String otp) {
        LOGGER.info("#### -> Forwarding OTP notification to -> {} to {}", email, notificationServiceUrl);
        try {
            Map<String, String> request = new HashMap<>();
            request.put("email", email);
            request.put("otp", otp);

            restTemplate.postForObject(notificationServiceUrl + "/api/notifications/send-otp", request, Void.class);
        } catch (Exception e) {
            LOGGER.error("Failed to forward OTP notification: {}", e.getMessage());
        }
    }

    @Async
    public void sendEnrollmentNotification(String studentName, String mentorName, String domain, String studentId, String mentorId) {
        LOGGER.info("#### -> Forwarding enrollment notification for student -> {} to {}", studentName, notificationServiceUrl);
        try {
            String studentEmail = "";
            try {
                studentEmail = userService.getUserProfile(studentId).getEmail();
            } catch (Exception e) {
                LOGGER.warn("Could not find email for student ID: {}, fallback to studentId if it looks like email", studentId);
                if (studentId != null && studentId.contains("@")) {
                    studentEmail = studentId;
                }
            }

            String mentorEmail = "";
            try {
                mentorEmail = userService.getUserProfile(mentorId).getEmail();
            } catch (Exception e) {
                LOGGER.warn("Could not find email for mentor ID: {}, fallback to mentorId if it looks like email", mentorId);
                if (mentorId != null && mentorId.contains("@")) {
                    mentorEmail = mentorId;
                }
            }

            Map<String, String> request = new HashMap<>();
            request.put("studentName", studentName);
            request.put("studentEmail", studentEmail);
            request.put("mentorName", mentorName);
            request.put("mentorEmail", mentorEmail);
            request.put("domain", domain);
            request.put("studentId", studentId);
            request.put("mentorId", mentorId);

            restTemplate.postForObject(notificationServiceUrl + "/api/notifications/send-enrollment", request, Void.class);
        } catch (Exception e) {
            LOGGER.error("Failed to forward enrollment notification: {}", e.getMessage());
        }
    }
}
