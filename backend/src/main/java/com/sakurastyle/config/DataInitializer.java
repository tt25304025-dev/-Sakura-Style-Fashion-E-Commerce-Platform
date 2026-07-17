package com.sakurastyle.config;

import com.sakurastyle.entity.Cart;
import com.sakurastyle.entity.Role;
import com.sakurastyle.entity.RoleName;
import com.sakurastyle.entity.User;
import com.sakurastyle.importer.ProductImportService;
import com.sakurastyle.repository.CartRepository;
import com.sakurastyle.repository.RoleRepository;
import com.sakurastyle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductImportService productImportService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRoles();
        seedUsers();
        // Categories + products are handled by ProductImportService (DummyJSON / local JSON)
        productImportService.importProducts();
    }

    private void seedRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (!roleRepository.existsByName(roleName)) {
                roleRepository.save(Role.builder().name(roleName).build());
                log.info("Created role: {}", roleName);
            }
        }
    }

    private void seedUsers() {
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN).orElseThrow();
        Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER).orElseThrow();

        if (!userRepository.existsByEmail("admin@sakurastyle.com")) {
            User admin = User.builder()
                    .email("admin@sakurastyle.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Sakura")
                    .lastName("Admin")
                    .phone("0700000000")
                    .roles(Set.of(adminRole))
                    .enabled(true)
                    .build();
            User saved = userRepository.save(admin);
            cartRepository.save(Cart.builder().user(saved).build());
            log.info("Created admin user: admin@sakurastyle.com");
        }

        if (!userRepository.existsByEmail("customer@sakurastyle.com")) {
            User customer = User.builder()
                    .email("customer@sakurastyle.com")
                    .password(passwordEncoder.encode("customer123"))
                    .firstName("Aiko")
                    .lastName("Tanaka")
                    .phone("0711111111")
                    .roles(Set.of(customerRole))
                    .enabled(true)
                    .build();
            User saved = userRepository.save(customer);
            cartRepository.save(Cart.builder().user(saved).build());
            log.info("Created customer user: customer@sakurastyle.com");
        }
    }
}
