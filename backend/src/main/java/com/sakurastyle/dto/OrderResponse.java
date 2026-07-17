package com.sakurastyle.dto;

import com.sakurastyle.entity.OrderStatus;
import com.sakurastyle.entity.PaymentStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class OrderResponse {

    private Long id;
    private Long userId;
    private String customerEmail;
    private String customerName;
    private List<OrderItemResponse> items;
    private AddressResponse shippingAddress;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
}
