package com.mini.notification_service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InternalNotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(InternalNotificationService.class);

    private final EmailService emailService;
    private final com.mini.user_service.Service.UserService userService;
    private final NotificationRepository notificationRepository;

    public InternalNotificationService(EmailService emailService, com.mini.user_service.Service.UserService userService, NotificationRepository notificationRepository) {
        this.emailService = emailService;
        this.userService = userService;
        this.notificationRepository = notificationRepository;
    }

    @Async
    public void sendNewExperienceNotification(String companyName) {
        LOGGER.info("#### -> Sending new experience notification for -> {}", companyName);
        try {
            List<com.mini.user_service.Dto.UserResponse> users = userService.getAllUsers();
            for (com.mini.user_service.Dto.UserResponse user : users) {
                emailService.sendEmail(user.getEmail(), "New Experience Added", "A new interview experience has been shared for company: " + companyName);
                
                Notification n = new Notification();
                n.setUserId(user.getId());
                n.setMessage("New Experience Added for: " + companyName);
                n.setType("EXPERIENCE");
                n.setTimestamp(java.time.LocalDateTime.now());
                notificationRepository.save(n);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to notify users about new experience: {}", e.getMessage());
        }
    }

    @Async
    public void sendOtpNotification(String email, String otp) {
        LOGGER.info("#### -> Sending OTP notification to -> {}", email);
        try {
            emailService.sendEmail(email, "Your Password Reset OTP", "Your OTP is: " + otp + ". Valid for 10 minutes.");
        } catch (Exception e) {
            LOGGER.error("Failed to send OTP notification: {}", e.getMessage());
        }
    }

    @Async
    public void sendEnrollmentNotification(String studentName, String mentorName, String domain, String studentId, String mentorId) {
        LOGGER.info("#### -> Sending enrollment notification for student -> {}", studentName);
        try {
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
