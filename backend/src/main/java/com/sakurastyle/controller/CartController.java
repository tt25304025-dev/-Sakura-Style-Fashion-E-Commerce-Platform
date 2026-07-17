package com.sakurastyle.controller;

import com.sakurastyle.dto.CartItemRequest;
import com.sakurastyle.dto.CartResponse;
import com.sakurastyle.security.SecurityUtils;
import com.sakurastyle.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getCart(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(SecurityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.updateItem(SecurityUtils.getCurrentUserId(), itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(SecurityUtils.getCurrentUserId(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clearCart() {
        return ResponseEntity.ok(cartService.clearCart(SecurityUtils.getCurrentUserId()));
    }
}
