package com.finsplit.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private BigDecimal monthIncome;
    private BigDecimal monthExpense;
    private Map<String, BigDecimal> expenseByCategory;
    private List<MonthlyData> monthlyIncome;
    private List<MonthlyData> monthlyExpense;

    @Data
    @Builder
    public static class MonthlyData {
        private int month;
        private String monthName;
        private BigDecimal amount;
    }
}
