package com.finsplit.repository;

import com.finsplit.entity.ExpenseSplit;
import com.finsplit.entity.GroupExpense;
import com.finsplit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {
    List<ExpenseSplit> findByExpense(GroupExpense expense);
    List<ExpenseSplit> findByUserAndSettledFalse(User user);

    @Query("SELECT COALESCE(SUM(s.amountOwed), 0) FROM ExpenseSplit s " +
           "WHERE s.user = :user AND s.settled = false AND s.expense.group.id = :groupId")
    BigDecimal sumUnsettledByUserAndGroup(@Param("user") User user, @Param("groupId") Long groupId);
}
