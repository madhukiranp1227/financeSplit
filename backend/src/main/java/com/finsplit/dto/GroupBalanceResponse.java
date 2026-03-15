package com.finsplit.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class GroupBalanceResponse {
    private Long groupId;
    private String groupName;
    private BigDecimal totalExpenses;
    private List<MemberBalance> balances;
    private List<SettlementSuggestion> suggestions;

    @Data
    @Builder
    public static class MemberBalance {
        private Long userId;
        private String userName;
        private BigDecimal paid;
        private BigDecimal owes;
        private BigDecimal net; // positive = owed money, negative = owes money
    }

    @Data
    @Builder
    public static class SettlementSuggestion {
        private Long fromUserId;
        private String fromUserName;
        private Long toUserId;
        private String toUserName;
        private BigDecimal amount;
    }
}
