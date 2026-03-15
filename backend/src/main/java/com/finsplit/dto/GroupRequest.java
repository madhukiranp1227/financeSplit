package com.finsplit.dto;

import com.finsplit.entity.Group;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class GroupRequest {
    @NotBlank private String name;
    private String description;
    private Group.GroupType type;
    private List<String> memberEmails; // emails of members to add
}
