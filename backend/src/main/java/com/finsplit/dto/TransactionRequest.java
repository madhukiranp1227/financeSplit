package com.finsplit.dto;

import com.finsplit.entity.Transaction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotBlank private String title;
    private String description;

    @NotNull @Positive
    private BigDecimal amount;

    @NotNull
    private Transaction.Type type;

    private Transaction.Category category;
    private LocalDate transactionDate;
}
