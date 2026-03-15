package com.finsplit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Settlement {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_id", nullable = false)
    private User payer; // who paid

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payee_id", nullable = false)
    private User payee; // who received

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    private String note;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @PrePersist
    public void prePersist() {
        this.settledAt = LocalDateTime.now();
    }
}
