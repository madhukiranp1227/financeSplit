package com.finsplit.repository;

import com.finsplit.entity.Group;
import com.finsplit.entity.Settlement;
import com.finsplit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByGroupOrderBySettledAtDesc(Group group);
    List<Settlement> findByPayerOrPayee(User payer, User payee);
}
