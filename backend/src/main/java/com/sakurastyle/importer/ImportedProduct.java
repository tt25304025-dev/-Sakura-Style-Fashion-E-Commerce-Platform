package com.sakurastyle.importer;

import java.math.BigDecimal;

/**
 * Normalized product ready to persist or serialize to local JSON.
 */
public record ImportedProduct(
        String name,
        String description,
        BigDecimal price,
        String categoryName,
        String imageUrl,
        Integer stockQuantity,
        String size,
        String color,
        String sourceSlug
) {
}
