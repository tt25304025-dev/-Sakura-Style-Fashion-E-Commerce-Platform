package com.sakurastyle.repository;

import com.sakurastyle.entity.Product;
import com.sakurastyle.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByCategoryIdAndStatus(Long categoryId, ProductStatus status, Pageable pageable);

    /**
     * Uses empty string (never null) for keyword to avoid PostgreSQL lower(bytea) binding errors.
     * categoryId = 0 means "all categories".
     */
    @Query("""
            SELECT p FROM Product p
            WHERE p.status = :status
            AND (:categoryId = 0L OR p.category.id = :categoryId)
            AND (
                :keyword = ''
                OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            """)
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("status") ProductStatus status,
            Pageable pageable
    );

    long countByStatus(ProductStatus status);

    boolean existsByNameIgnoreCase(String name);

    java.util.Optional<Product> findByNameIgnoreCase(String name);
}
