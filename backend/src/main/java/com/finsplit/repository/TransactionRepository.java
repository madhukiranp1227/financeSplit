package com.finsplit.repository;

import com.finsplit.entity.Transaction;
import com.finsplit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserOrderByTransactionDateDesc(User user);

    List<Transaction> findByUserAndTypeOrderByTransactionDateDesc(User user, Transaction.Type type);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user " +
           "AND t.transactionDate BETWEEN :start AND :end ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserAndDateRange(@Param("user") User user,
                                              @Param("start") LocalDate start,
                                              @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type")
    BigDecimal sumByUserAndType(@Param("user") User user, @Param("type") Transaction.Type type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user " +
           "AND t.type = :type AND t.transactionDate BETWEEN :start AND :end")
    BigDecimal sumByUserAndTypeAndDateRange(@Param("user") User user,
                                             @Param("type") Transaction.Type type,
                                             @Param("start") LocalDate start,
                                             @Param("end") LocalDate end);

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t " +
           "WHERE t.user = :user AND t.type = 'EXPENSE' " +
           "AND t.transactionDate BETWEEN :start AND :end " +
           "GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> getExpenseByCategory(@Param("user") User user,
                                          @Param("start") LocalDate start,
                                          @Param("end") LocalDate end);

    @Query("SELECT MONTH(t.transactionDate), SUM(t.amount) FROM Transaction t " +
           "WHERE t.user = :user AND t.type = :type AND YEAR(t.transactionDate) = :year " +
           "GROUP BY MONTH(t.transactionDate) ORDER BY MONTH(t.transactionDate)")
    List<Object[]> getMonthlyTotals(@Param("user") User user,
                                      @Param("type") Transaction.Type type,
                                      @Param("year") int year);
}
