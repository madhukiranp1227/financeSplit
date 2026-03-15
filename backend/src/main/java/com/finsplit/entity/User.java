package com.finsplit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    @JsonIgnore
    private String password;

    private String currency; // USD, INR, EUR

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Transaction> transactions;

    @JsonIgnore
    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
    private List<Group> createdGroups;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.currency == null) this.currency = "USD";
    }
}
