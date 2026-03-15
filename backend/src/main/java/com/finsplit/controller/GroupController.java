package com.finsplit.controller;

import com.finsplit.dto.GroupBalanceResponse;
import com.finsplit.dto.GroupExpenseRequest;
import com.finsplit.dto.GroupRequest;
import com.finsplit.entity.*;
import com.finsplit.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<Group>> getMyGroups() {
        return ResponseEntity.ok(groupService.getMyGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroup(id));
    }

    @PostMapping
    public ResponseEntity<Group> createGroup(@Valid @RequestBody GroupRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(req));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Void> addMember(@PathVariable Long id, @RequestBody Map<String, String> body) {
        groupService.addMember(id, body.get("email"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMember>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getMembers(id));
    }

    @GetMapping("/{id}/expenses")
    public ResponseEntity<List<GroupExpense>> getExpenses(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getExpenses(id));
    }

    @PostMapping("/{id}/expenses")
    public ResponseEntity<GroupExpense> addExpense(@PathVariable Long id,
                                                    @Valid @RequestBody GroupExpenseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.addExpense(id, req));
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<GroupBalanceResponse> getBalance(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupBalance(id));
    }

    @PostMapping("/{id}/settle")
    public ResponseEntity<Settlement> settle(@PathVariable Long id,
                                              @RequestBody Map<String, Object> body) {
        Long payeeId = Long.valueOf(body.get("payeeId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String note = body.getOrDefault("note", "").toString();
        return ResponseEntity.ok(groupService.settle(id, payeeId, amount, note));
    }
}
