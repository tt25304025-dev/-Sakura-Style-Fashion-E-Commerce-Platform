package com.sakurastyle.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {

    @NotNull(message = "Shipping address is required")
    @Valid
    private AddressRequest shippingAddress;
}
