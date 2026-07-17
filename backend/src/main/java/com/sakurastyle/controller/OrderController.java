package com.sakurastyle.controller;

import com.sakurastyle.dto.*;
import com.sakurastyle.security.SecurityUtils;
import com.sakurastyle.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.checkout(SecurityUtils.getCurrentUserId(), request));
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(orderService.getOrdersForUser(SecurityUtils.getCurrentUserId(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getMyOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderForUser(SecurityUtils.getCurrentUserId(), id));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<AddressResponse>> getAddresses() {
        return ResponseEntity.ok(orderService.getAddresses(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<AddressResponse> addAddress(@Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.addAddress(SecurityUtils.getCurrentUserId(), request));
    }
}
