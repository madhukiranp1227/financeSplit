package com.finsplit.dto;

import com.finsplit.entity.GroupExpense;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
public class GroupExpenseRequest {
    @NotBlank private String title;
    private String description;

    @NotNull @Positive
    private BigDecimal totalAmount;

    private GroupExpense.SplitType splitType; // EQUAL or CUSTOM

    private LocalDate expenseDate;

    // For CUSTOM split: userId -> amount
    private Map<Long, BigDecimal> customSplits;
}
