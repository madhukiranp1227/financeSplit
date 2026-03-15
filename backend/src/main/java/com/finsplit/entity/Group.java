package com.finsplit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_groups")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Group {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private GroupType type; // TRIP, HOME, FRIENDS, WORK, OTHER

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    private List<GroupMember> members;

    @JsonIgnore
    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    private List<GroupExpense> expenses;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.type == null) this.type = GroupType.OTHER;
    }

    public enum GroupType { TRIP, HOME, FRIENDS, WORK, OTHER }
}
