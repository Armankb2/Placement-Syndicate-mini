package com.mini.notification_service;

import com.mini.notification_service.dto.SendEnrollmentRequest;
import com.mini.notification_service.dto.SendNewExperienceRequest;
import com.mini.notification_service.dto.SendOtpRequest;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repository;
    private final InternalNotificationService internalNotificationService;

    public NotificationController(NotificationRepository repository, InternalNotificationService internalNotificationService) {
        this.repository = repository;
        this.internalNotificationService = internalNotificationService;
    }

    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable String userId) {
        return repository.findByUserIdOrderByTimestampDesc(userId);
    }

    @PostMapping("/send")
    public Notification sendNotification(@RequestBody Notification notification) {
        notification.setTimestamp(java.time.LocalDateTime.now());
        notification.setRead(false);
        return repository.save(notification);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable String id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    @PostMapping("/send-otp")
    public void sendOtp(@RequestBody SendOtpRequest request) {
        internalNotificationService.sendOtpNotification(request.getEmail(), request.getOtp());
    }

    @PostMapping("/send-enrollment")
    public void sendEnrollment(@RequestBody SendEnrollmentRequest request) {
        internalNotificationService.sendEnrollmentNotification(request);
    }

    @PostMapping("/send-experience")
    public void sendExperience(@RequestBody SendNewExperienceRequest request) {
        internalNotificationService.sendNewExperienceNotification(request);
    }
}
