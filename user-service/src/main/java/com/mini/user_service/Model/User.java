package com.mini.user_service.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private Integer year;
    private String keyCloakId;


    @Enumerated(EnumType.STRING)
    private UserRole role;

    @CreationTimestamp
    private LocalDateTime createdDate;

    @PrePersist
    @PreUpdate
    private void assignRoleFromYear() {
        if (this.year == null) {
            // if year is unknown, don't change role (or set a sensible default)
            return;
        }

        if (this.year >= 4) {
            this.role = UserRole.Senior;
        } else if (this.year > 0) {
            this.role = UserRole.Junior;
        } else {
            // non-positive year -- default to Junior
            this.role = UserRole.Junior;
        }
    }

}
