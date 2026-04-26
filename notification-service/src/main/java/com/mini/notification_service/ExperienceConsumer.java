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

    public ExperienceConsumer(EmailService emailService, UserClient userClient) {
        this.emailService = emailService;
        this.userClient = userClient;
    }

    @KafkaListener(topics = "new-experiences", groupId = "notification-group")
    public void consume(String message) {
        LOGGER.info(String.format("#### -> Consumed message -> %s", message));

        List<User> users = userClient.getAllUsers();
        for (User user : users) {
            emailService.sendEmail(user.getEmail(), "New Experience Added", message);
        }
    }
}
