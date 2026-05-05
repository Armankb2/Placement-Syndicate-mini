package com.mini.notification_service;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repository;

    public NotificationController(NotificationRepository repository) {
        this.repository = repository;
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
}
