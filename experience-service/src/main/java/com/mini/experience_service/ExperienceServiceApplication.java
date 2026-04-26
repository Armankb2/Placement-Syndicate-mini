package com.mini.experience_service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.core.MongoTemplate;

@SpringBootApplication
public class ExperienceServiceApplication {

//	@Autowired
//	private MongoTemplate mongoTemplate;
//
//	@PostConstruct
//	public void printDbName() {
//		System.out.println("Connected to DB: " + mongoTemplate.getDb().getName());
//	}
	public static void main(String[] args) {

		SpringApplication.run(ExperienceServiceApplication.class, args);



	}

}
