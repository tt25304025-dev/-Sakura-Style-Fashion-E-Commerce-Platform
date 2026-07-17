package com.sakurastyle.service;

import com.sakurastyle.dto.DashboardResponse;
import com.sakurastyle.entity.PaymentStatus;
import com.sakurastyle.repository.OrderRepository;
import com.sakurastyle.repository.ProductRepository;
import com.sakurastyle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public DashboardResponse getDashboard() {
        BigDecimal totalSales = orderRepository.sumTotalAmountByPaymentStatus(PaymentStatus.PAID);
        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        return DashboardResponse.builder()
                .totalProducts(productRepository.count())
                .totalUsers(userRepository.count())
                .totalOrders(orderRepository.count())
                .totalSales(totalSales)
                .build();
    }
}
