package com.mini.notification_service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExperienceConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExperienceConsumer.class);

    private final EmailService emailService;
    private final UserClient userClient;
    private final NotificationRepository notificationRepository;

    public ExperienceConsumer(EmailService emailService, UserClient userClient, NotificationRepository notificationRepository) {
        this.emailService = emailService;
        this.userClient = userClient;
        this.notificationRepository = notificationRepository;
    }

    @KafkaListener(topics = "new-experiences", groupId = "notification-group")
    public void consumeNewExperience(String message) {
        LOGGER.info(String.format("#### -> Consumed new experience -> %s", message));
        try {
            List<User> users = userClient.getAllUsers();
            for (User user : users) {
                emailService.sendEmail(user.getEmail(), "New Experience Added", "A new interview experience has been shared: " + message);
                
                Notification n = new Notification();
                n.setUserId(user.getId());
                n.setMessage("New Experience Added: " + message);
                n.setType("EXPERIENCE");
                n.setTimestamp(java.time.LocalDateTime.now());
                notificationRepository.save(n);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to notify users about new experience: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "email-notifications", groupId = "notification-group")
    public void consumeOtp(String message) {
        LOGGER.info(String.format("#### -> Consumed OTP notification -> %s", message));
        try {
            com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(message);
            String email = node.get("email").asText();
            String otp = node.get("otp").asText();
            emailService.sendEmail(email, "Your Password Reset OTP", "Your OTP is: " + otp + ". Valid for 10 minutes.");
        } catch (Exception e) {
            LOGGER.error("Failed to process OTP notification: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "enrollment-notification", groupId = "notification-group")
    public void consumeEnrollment(String message) {
        LOGGER.info(String.format("#### -> Consumed enrollment notification -> %s", message));
        try {
            com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(message);
            String studentName = node.get("studentName").asText();
            String mentorName = node.get("mentorName").asText();
            String domain = node.get("domain").asText();
            String studentId = node.get("studentId").asText();
            String mentorId = node.get("mentorId").asText();
            
            // Send to Student
            emailService.sendEmail(studentId, "Enrollment Confirmed", 
                String.format("Hi %s, you have successfully enrolled in the %s program with %s.", studentName, domain, mentorName));
            
            Notification studentNotif = new Notification();
            studentNotif.setUserId(studentId);
            studentNotif.setMessage(String.format("Enrolled in %s with %s", domain, mentorName));
            studentNotif.setType("ENROLLMENT");
            studentNotif.setTimestamp(java.time.LocalDateTime.now());
            notificationRepository.save(studentNotif);
            
            // Send to Mentor
            emailService.sendEmail(mentorId, "New Student Enrolled", 
                String.format("Hi %s, %s has enrolled in your %s program.", mentorName, studentName, domain));

            Notification mentorNotif = new Notification();
            mentorNotif.setUserId(mentorId);
            mentorNotif.setMessage(String.format("%s enrolled in your %s program", studentName, domain));
            mentorNotif.setType("ENROLLMENT");
            mentorNotif.setTimestamp(java.time.LocalDateTime.now());
            notificationRepository.save(mentorNotif);

        } catch (Exception e) {
            LOGGER.error("Failed to process enrollment notification: {}", e.getMessage());
        }
    }
}
