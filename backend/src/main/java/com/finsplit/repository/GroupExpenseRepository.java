package com.finsplit.repository;

import com.finsplit.entity.Group;
import com.finsplit.entity.GroupExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface GroupExpenseRepository extends JpaRepository<GroupExpense, Long> {
    List<GroupExpense> findByGroupOrderByExpenseDateDesc(Group group);

    @Query("SELECT COALESCE(SUM(e.totalAmount), 0) FROM GroupExpense e WHERE e.group = :group")
    BigDecimal sumTotalByGroup(@Param("group") Group group);
}
