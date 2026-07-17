package com.sakurastyle.service;

import com.sakurastyle.dto.CartItemRequest;
import com.sakurastyle.dto.CartItemResponse;
import com.sakurastyle.dto.CartResponse;
import com.sakurastyle.entity.*;
import com.sakurastyle.exception.BadRequestException;
import com.sakurastyle.exception.ResourceNotFoundException;
import com.sakurastyle.repository.CartItemRepository;
import com.sakurastyle.repository.CartRepository;
import com.sakurastyle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse getCart(Long userId) {
        return toResponse(getOrCreateCart(userId));
    }

    @Transactional
    public CartResponse addItem(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productService.findProduct(request.getProductId());

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new BadRequestException("Product is not available");
        }
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }

        String size = request.getSize() != null ? request.getSize() : product.getSize();

        cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId())
                        && ((size == null && item.getSize() == null)
                        || (size != null && size.equals(item.getSize()))))
                .findFirst()
                .ifPresentOrElse(
                        item -> {
                            int newQty = item.getQuantity() + request.getQuantity();
                            if (product.getStockQuantity() < newQty) {
                                throw new BadRequestException("Insufficient stock for product: " + product.getName());
                            }
                            item.setQuantity(newQty);
                        },
                        () -> {
                            CartItem item = CartItem.builder()
                                    .product(product)
                                    .quantity(request.getQuantity())
                                    .size(size)
                                    .build();
                            cart.addItem(item);
                        }
                );

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItem(Long userId, Long itemId, CartItemRequest request) {
        CartItem item = cartItemRepository.findByIdAndCartUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (request.getQuantity() > item.getProduct().getStockQuantity()) {
            throw new BadRequestException("Insufficient stock");
        }

        item.setQuantity(request.getQuantity());
        if (request.getSize() != null) {
            item.setSize(request.getSize());
        }

        cartItemRepository.save(item);
        return getCart(userId);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(ci -> ci.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        cart.removeItem(item);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.clearItems();
        return toResponse(cartRepository.save(cart));
    }

    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart cart = Cart.builder().user(user).build();
            return cartRepository.save(cart);
        });
    }

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream().map(this::toItemResponse).toList();
        BigDecimal total = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalItems = items.stream().mapToInt(CartItemResponse::getQuantity).sum();

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalAmount(total)
                .totalItems(totalItems)
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        BigDecimal subtotal = item.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .imageUrl(item.getProduct().getImageUrl())
                .price(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .size(item.getSize())
                .color(item.getProduct().getColor())
                .subtotal(subtotal)
                .build();
    }
}
