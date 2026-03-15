package com.finsplit.repository;

import com.finsplit.entity.Group;
import com.finsplit.entity.GroupMember;
import com.finsplit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroup(Group group);
    Optional<GroupMember> findByGroupAndUser(Group group, User user);
    boolean existsByGroupAndUser(Group group, User user);
}
