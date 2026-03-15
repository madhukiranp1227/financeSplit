package com.finsplit.controller;

import com.finsplit.dto.DashboardResponse;
import com.finsplit.dto.TransactionRequest;
import com.finsplit.entity.Transaction;
import com.finsplit.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestParam(required = false) Transaction.Type type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(transactionService.getMyTransactions(type, start, end));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(transactionService.getDashboard());
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@Valid @RequestBody TransactionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createTransaction(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable Long id, @Valid @RequestBody TransactionRequest req) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
