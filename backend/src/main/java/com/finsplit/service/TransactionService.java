package com.finsplit.service;

import com.finsplit.dto.DashboardResponse;
import com.finsplit.dto.TransactionRequest;
import com.finsplit.entity.Transaction;
import com.finsplit.entity.User;
import com.finsplit.exception.ResourceNotFoundException;
import com.finsplit.repository.TransactionRepository;
import com.finsplit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<Transaction> getMyTransactions(Transaction.Type type, LocalDate start, LocalDate end) {
        User user = getCurrentUser();
        if (start != null && end != null)
            return transactionRepository.findByUserAndDateRange(user, start, end);
        if (type != null)
            return transactionRepository.findByUserAndTypeOrderByTransactionDateDesc(user, type);
        return transactionRepository.findByUserOrderByTransactionDateDesc(user);
    }

    public Transaction createTransaction(TransactionRequest req) {
        User user = getCurrentUser();
        Transaction t = Transaction.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .amount(req.getAmount())
                .type(req.getType())
                .category(req.getCategory())
                .transactionDate(req.getTransactionDate())
                .user(user)
                .build();
        return transactionRepository.save(t);
    }

    public Transaction updateTransaction(Long id, TransactionRequest req) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        t.setTitle(req.getTitle());
        t.setDescription(req.getDescription());
        t.setAmount(req.getAmount());
        t.setType(req.getType());
        t.setCategory(req.getCategory());
        if (req.getTransactionDate() != null) t.setTransactionDate(req.getTransactionDate());
        return transactionRepository.save(t);
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id))
            throw new ResourceNotFoundException("Transaction not found");
        transactionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        User user = getCurrentUser();
        int year = LocalDate.now().getYear();
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = LocalDate.now();

        BigDecimal totalIncome = transactionRepository.sumByUserAndType(user, Transaction.Type.INCOME);
        BigDecimal totalExpense = transactionRepository.sumByUserAndType(user, Transaction.Type.EXPENSE);
        BigDecimal monthIncome = transactionRepository.sumByUserAndTypeAndDateRange(user, Transaction.Type.INCOME, monthStart, monthEnd);
        BigDecimal monthExpense = transactionRepository.sumByUserAndTypeAndDateRange(user, Transaction.Type.EXPENSE, monthStart, monthEnd);

        // Category breakdown (current month)
        LocalDate yearStart = LocalDate.of(year, 1, 1);
        LocalDate yearEnd = LocalDate.of(year, 12, 31);
        List<Object[]> catData = transactionRepository.getExpenseByCategory(user, yearStart, yearEnd);
        Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();
        catData.forEach(row -> expenseByCategory.put(row[0].toString(), (BigDecimal) row[1]));

        // Monthly breakdown
        List<Object[]> incomeData = transactionRepository.getMonthlyTotals(user, Transaction.Type.INCOME, year);
        List<Object[]> expenseData = transactionRepository.getMonthlyTotals(user, Transaction.Type.EXPENSE, year);

        return DashboardResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(totalIncome.subtract(totalExpense))
                .monthIncome(monthIncome)
                .monthExpense(monthExpense)
                .expenseByCategory(expenseByCategory)
                .monthlyIncome(toMonthlyData(incomeData))
                .monthlyExpense(toMonthlyData(expenseData))
                .build();
    }

    private List<DashboardResponse.MonthlyData> toMonthlyData(List<Object[]> rows) {
        List<DashboardResponse.MonthlyData> result = new ArrayList<>();
        for (Object[] row : rows) {
            int m = ((Number) row[0]).intValue();
            result.add(DashboardResponse.MonthlyData.builder()
                    .month(m)
                    .monthName(Month.of(m).name())
                    .amount(((BigDecimal) row[1]).setScale(2, RoundingMode.HALF_UP))
                    .build());
        }
        return result;
    }
}
