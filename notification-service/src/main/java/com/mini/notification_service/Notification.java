package com.mini.notification_service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;
    private String message;
    private String type; // e.g., ENROLLMENT, CHAT, EXPERIENCE
    private LocalDateTime timestamp;
    private boolean read;
}
