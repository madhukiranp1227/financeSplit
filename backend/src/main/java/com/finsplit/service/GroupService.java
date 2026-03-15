package com.finsplit.service;

import com.finsplit.dto.GroupBalanceResponse;
import com.finsplit.dto.GroupExpenseRequest;
import com.finsplit.dto.GroupRequest;
import com.finsplit.entity.*;
import com.finsplit.exception.BadRequestException;
import com.finsplit.exception.ResourceNotFoundException;
import com.finsplit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final GroupExpenseRepository expenseRepository;
    private final ExpenseSplitRepository splitRepository;
    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<Group> getMyGroups() {
        return groupRepository.findGroupsByMember(getCurrentUser());
    }

    @Transactional(readOnly = true)
    public Group getGroup(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    }

    public Group createGroup(GroupRequest req) {
        User creator = getCurrentUser();
        Group group = Group.builder()
                .name(req.getName())
                .description(req.getDescription())
                .type(req.getType() != null ? req.getType() : Group.GroupType.OTHER)
                .createdBy(creator)
                .build();
        group = groupRepository.save(group);

        // Add creator as admin
        memberRepository.save(GroupMember.builder()
                .group(group).user(creator).role(GroupMember.Role.ADMIN).build());

        // Add other members
        if (req.getMemberEmails() != null) {
            for (String email : req.getMemberEmails()) {
                userRepository.findByEmail(email).ifPresent(u -> {
                    if (!memberRepository.existsByGroupAndUser(group, u)) {
                        memberRepository.save(GroupMember.builder()
                                .group(group).user(u).role(GroupMember.Role.MEMBER).build());
                    }
                });
            }
        }
        return group;
    }

    public void addMember(Long groupId, String email) {
        Group group = getGroup(groupId);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        if (memberRepository.existsByGroupAndUser(group, user))
            throw new BadRequestException("User is already a member");
        memberRepository.save(GroupMember.builder().group(group).user(user).role(GroupMember.Role.MEMBER).build());
    }

    @Transactional(readOnly = true)
    public List<GroupMember> getMembers(Long groupId) {
        return memberRepository.findByGroup(getGroup(groupId));
    }

    @Transactional(readOnly = true)
    public List<GroupExpense> getExpenses(Long groupId) {
        return expenseRepository.findByGroupOrderByExpenseDateDesc(getGroup(groupId));
    }

    public GroupExpense addExpense(Long groupId, GroupExpenseRequest req) {
        Group group = getGroup(groupId);
        User paidBy = getCurrentUser();

        GroupExpense expense = GroupExpense.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .totalAmount(req.getTotalAmount())
                .group(group)
                .paidBy(paidBy)
                .splitType(req.getSplitType() != null ? req.getSplitType() : GroupExpense.SplitType.EQUAL)
                .expenseDate(req.getExpenseDate())
                .build();
        expense = expenseRepository.save(expense);

        List<GroupMember> members = memberRepository.findByGroup(group);

        if (expense.getSplitType() == GroupExpense.SplitType.EQUAL) {
            BigDecimal perPerson = req.getTotalAmount()
                    .divide(BigDecimal.valueOf(members.size()), 2, RoundingMode.HALF_UP);
            for (GroupMember m : members) {
                splitRepository.save(ExpenseSplit.builder()
                        .expense(expense)
                        .user(m.getUser())
                        .amountOwed(m.getUser().getId().equals(paidBy.getId()) ? BigDecimal.ZERO : perPerson)
                        .settled(m.getUser().getId().equals(paidBy.getId()))
                        .build());
            }
        } else if (req.getCustomSplits() != null) {
            for (Map.Entry<Long, BigDecimal> entry : req.getCustomSplits().entrySet()) {
                User u = userRepository.findById(entry.getKey())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                splitRepository.save(ExpenseSplit.builder()
                        .expense(expense).user(u).amountOwed(entry.getValue())
                        .settled(u.getId().equals(paidBy.getId())).build());
            }
        }
        return expense;
    }

    public Settlement settle(Long groupId, Long payeeId, BigDecimal amount, String note) {
        Group group = getGroup(groupId);
        User payer = getCurrentUser();
        User payee = userRepository.findById(payeeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Settlement s = Settlement.builder()
                .group(group).payer(payer).payee(payee).amount(amount).note(note).build();
        return settlementRepository.save(s);
    }

    @Transactional(readOnly = true)
    public GroupBalanceResponse getGroupBalance(Long groupId) {
        Group group = getGroup(groupId);
        List<GroupMember> members = memberRepository.findByGroup(group);
        List<GroupExpense> expenses = expenseRepository.findByGroupOrderByExpenseDateDesc(group);
        BigDecimal totalExpenses = expenseRepository.sumTotalByGroup(group);

        // Calculate how much each person paid and owes
        Map<Long, BigDecimal> paid = new HashMap<>();
        Map<Long, BigDecimal> owes = new HashMap<>();

        for (GroupMember m : members) {
            paid.put(m.getUser().getId(), BigDecimal.ZERO);
            owes.put(m.getUser().getId(), BigDecimal.ZERO);
        }

        for (GroupExpense exp : expenses) {
            Long payerId = exp.getPaidBy().getId();
            paid.merge(payerId, exp.getTotalAmount(), BigDecimal::add);

            List<ExpenseSplit> splits = splitRepository.findByExpense(exp);
            for (ExpenseSplit split : splits) {
                if (!split.isSettled()) {
                    owes.merge(split.getUser().getId(), split.getAmountOwed(), BigDecimal::add);
                }
            }
        }

        List<GroupBalanceResponse.MemberBalance> balances = new ArrayList<>();
        for (GroupMember m : members) {
            Long uid = m.getUser().getId();
            BigDecimal p = paid.getOrDefault(uid, BigDecimal.ZERO);
            BigDecimal o = owes.getOrDefault(uid, BigDecimal.ZERO);
            balances.add(GroupBalanceResponse.MemberBalance.builder()
                    .userId(uid)
                    .userName(m.getUser().getName())
                    .paid(p)
                    .owes(o)
                    .net(p.subtract(o))
                    .build());
        }

        // Minimized settlement suggestions
        List<GroupBalanceResponse.SettlementSuggestion> suggestions = computeSettlements(balances, members);

        return GroupBalanceResponse.builder()
                .groupId(groupId)
                .groupName(group.getName())
                .totalExpenses(totalExpenses)
                .balances(balances)
                .suggestions(suggestions)
                .build();
    }

    private List<GroupBalanceResponse.SettlementSuggestion> computeSettlements(
            List<GroupBalanceResponse.MemberBalance> balances, List<GroupMember> members) {
        List<GroupBalanceResponse.SettlementSuggestion> suggestions = new ArrayList<>();

        Map<Long, String> nameMap = new HashMap<>();
        members.forEach(m -> nameMap.put(m.getUser().getId(), m.getUser().getName()));

        List<long[]> debtors = new ArrayList<>();  // [id, amount*100 as long]
        List<long[]> creditors = new ArrayList<>();

        for (GroupBalanceResponse.MemberBalance b : balances) {
            long net = b.getNet().multiply(BigDecimal.valueOf(100)).longValue();
            if (net < 0) debtors.add(new long[]{b.getUserId(), -net});
            else if (net > 0) creditors.add(new long[]{b.getUserId(), net});
        }

        int i = 0, j = 0;
        while (i < debtors.size() && j < creditors.size()) {
            long[] debtor = debtors.get(i);
            long[] creditor = creditors.get(j);
            long amount = Math.min(debtor[1], creditor[1]);

            suggestions.add(GroupBalanceResponse.SettlementSuggestion.builder()
                    .fromUserId(debtor[0]).fromUserName(nameMap.get(debtor[0]))
                    .toUserId(creditor[0]).toUserName(nameMap.get(creditor[0]))
                    .amount(BigDecimal.valueOf(amount).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))
                    .build());

            debtor[1] -= amount;
            creditor[1] -= amount;
            if (debtor[1] == 0) i++;
            if (creditor[1] == 0) j++;
        }
        return suggestions;
    }
}
