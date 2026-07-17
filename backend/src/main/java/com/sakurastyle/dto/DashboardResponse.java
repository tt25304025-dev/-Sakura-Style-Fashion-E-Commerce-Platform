package com.sakurastyle.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class DashboardResponse {

    private long totalProducts;
    private long totalUsers;
    private long totalOrders;
    private BigDecimal totalSales;
}
