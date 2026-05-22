package com.mini.notification_service;

import com.mini.notification_service.dto.SendEnrollmentRequest;
import com.mini.notification_service.dto.SendNewExperienceRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class InternalNotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(InternalNotificationService.class);

    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public InternalNotificationService(EmailService emailService, NotificationRepository notificationRepository) {
        this.emailService = emailService;
        this.notificationRepository = notificationRepository;
    }

    @Async
    public void sendNewExperienceNotification(SendNewExperienceRequest request) {
        LOGGER.info("#### -> Sending new experience notification for -> {}", request.getCompanyName());
        try {
            if (request.getUsers() == null) return;
            for (SendNewExperienceRequest.UserDto user : request.getUsers()) {
                if (user.getEmail() == null || user.getEmail().isEmpty()) continue;
                emailService.sendEmail(user.getEmail(), "New Experience Added", "A new interview experience has been shared for company: " + request.getCompanyName());
                
                Notification n = new Notification();
                n.setUserId(user.getId());
                n.setMessage("New Experience Added for: " + request.getCompanyName());
                n.setType("EXPERIENCE");
                n.setTimestamp(LocalDateTime.now());
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
    public void sendEnrollmentNotification(SendEnrollmentRequest request) {
        LOGGER.info("#### -> Sending enrollment notification for student -> {}", request.getStudentName());
        try {
            // Send to Student
            if (request.getStudentEmail() != null && !request.getStudentEmail().isEmpty()) {
                emailService.sendEmail(request.getStudentEmail(), "Enrollment Confirmed", 
                    String.format("Hi %s, you have successfully enrolled in the %s program with %s.", request.getStudentName(), request.getDomain(), request.getMentorName()));
            }
            
            Notification studentNotif = new Notification();
            studentNotif.setUserId(request.getStudentId());
            studentNotif.setMessage(String.format("Enrolled in %s with %s", request.getDomain(), request.getMentorName()));
            studentNotif.setType("ENROLLMENT");
            studentNotif.setTimestamp(LocalDateTime.now());
            notificationRepository.save(studentNotif);
            
            // Send to Mentor
            if (request.getMentorEmail() != null && !request.getMentorEmail().isEmpty()) {
                emailService.sendEmail(request.getMentorEmail(), "New Student Enrolled", 
                    String.format("Hi %s, %s has enrolled in your %s program.", request.getMentorName(), request.getStudentName(), request.getDomain()));
            }

            Notification mentorNotif = new Notification();
            mentorNotif.setUserId(request.getMentorId());
            mentorNotif.setMessage(String.format("%s enrolled in your %s program", request.getStudentName(), request.getDomain()));
            mentorNotif.setType("ENROLLMENT");
            mentorNotif.setTimestamp(LocalDateTime.now());
            notificationRepository.save(mentorNotif);

        } catch (Exception e) {
            LOGGER.error("Failed to process enrollment notification: {}", e.getMessage());
        }
    }
}
