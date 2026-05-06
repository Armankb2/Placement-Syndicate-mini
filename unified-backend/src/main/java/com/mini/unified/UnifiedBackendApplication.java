package com.mini.unified;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@ComponentScan(basePackages = "com.mini")
@EnableJpaRepositories(basePackages = "com.mini.user_service.Repository")
@EntityScan(basePackages = "com.mini.user_service.Model")
@EnableMongoRepositories(basePackages = {
    "com.mini.experience_service.Repository",
    "com.mini.mentorship_service.Repository",
    "com.mini.notification_service.Repository"
})
public class UnifiedBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(UnifiedBackendApplication.class, args);
    }
}
