package com.sakurastyle.importer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sakurastyle.entity.Category;
import com.sakurastyle.entity.Product;
import com.sakurastyle.entity.ProductStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Maps DummyJSON payloads and imported DTOs to Sakura Style product shapes.
 * Prices are converted to Japanese Yen (JPY).
 */
@Component
@RequiredArgsConstructor
public class ProductMapper {

    private static final String[] SIZES = {"S", "M", "L", "XL"};
    private static final String[] COLORS = {"Black", "White", "Pink", "Beige", "Navy", "Red", "Gold", "Silver"};
    /** Threshold: amounts below this are treated as USD-like and converted to JPY. */
    private static final BigDecimal USD_PRICE_CEILING = BigDecimal.valueOf(5000);

    private final ObjectMapper objectMapper;
    private final ImportConfiguration importConfiguration;

    public ImportedProduct fromDummyJson(JsonNode product, String sakuraCategory, String sourceSlug, int index) {
        String name = product.path("title").asText("Untitled");
        String description = product.path("description").asText("");
        BigDecimal usdPrice = BigDecimal.valueOf(product.path("price").asDouble(0));
        BigDecimal yenPrice = toYen(usdPrice);

        String imageUrl = product.path("thumbnail").asText("");
        JsonNode images = product.get("images");
        if (images != null && images.isArray() && !images.isEmpty()) {
            String first = images.get(0).asText("");
            if (StringUtils.hasText(first)) {
                imageUrl = first;
            }
        }

        int stock = product.path("stock").asInt(20);
        if (stock < 0) {
            stock = 20;
        }

        return new ImportedProduct(
                name,
                description,
                yenPrice,
                sakuraCategory,
                imageUrl,
                stock,
                SIZES[index % SIZES.length],
                COLORS[index % COLORS.length],
                sourceSlug
        );
    }

    public ImportedProduct fromJsonNode(JsonNode node) {
        ImportedProduct imported = objectMapper.convertValue(node, ImportedProduct.class);
        if (imported.price() != null && imported.price().compareTo(USD_PRICE_CEILING) < 0) {
            return new ImportedProduct(
                    imported.name(),
                    imported.description(),
                    toYen(imported.price()),
                    imported.categoryName(),
                    imported.imageUrl(),
                    imported.stockQuantity(),
                    imported.size(),
                    imported.color(),
                    imported.sourceSlug()
            );
        }
        return imported;
    }

    public Product toEntity(ImportedProduct imported, Category category) {
        return Product.builder()
                .name(imported.name())
                .description(imported.description())
                .price(imported.price())
                .category(category)
                .imageUrl(imported.imageUrl())
                .stockQuantity(imported.stockQuantity() != null ? imported.stockQuantity() : 20)
                .size(imported.size())
                .color(imported.color())
                .status(ProductStatus.ACTIVE)
                .build();
    }

    public BigDecimal toYen(BigDecimal usdLikeAmount) {
        if (usdLikeAmount == null) {
            return BigDecimal.ZERO;
        }
        return usdLikeAmount
                .multiply(BigDecimal.valueOf(importConfiguration.getUsdToYenRate()))
                .setScale(0, RoundingMode.HALF_UP);
    }
}
