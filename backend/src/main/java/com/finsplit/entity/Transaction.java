package com.finsplit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type; // INCOME or EXPENSE

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.transactionDate == null) this.transactionDate = LocalDate.now();
    }

    public enum Type { INCOME, EXPENSE }

    public enum Category {
        // Income
        SALARY, FREELANCE, INVESTMENT, BUSINESS, OTHER_INCOME,
        // Expense
        FOOD, RENT, TRANSPORT, UTILITIES, ENTERTAINMENT,
        HEALTH, SHOPPING, EDUCATION, TRAVEL, OTHER_EXPENSE
    }
}
