package com.sakurastyle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String type;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
}
