package com.sakurastyle.dto;

import com.sakurastyle.entity.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {

    @jakarta.validation.constraints.NotNull(message = "Status is required")
    private OrderStatus status;
}
