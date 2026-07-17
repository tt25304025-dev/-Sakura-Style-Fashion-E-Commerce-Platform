package com.sakurastyle.importer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.sakurastyle.entity.Category;
import com.sakurastyle.entity.Product;
import com.sakurastyle.repository.CategoryRepository;
import com.sakurastyle.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Orchestrates one-time DummyJSON download, local JSON caching, and DB seeding.
 * Never fails application startup due to external API issues.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductImportService {

    private final ImportConfiguration importConfiguration;
    private final DummyJsonClient dummyJsonClient;
    private final ProductMapper productMapper;
    private final ObjectMapper objectMapper;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void importProducts() {
        if (!importConfiguration.isEnabled()) {
            log.info("Product import is disabled (sakura.import.enabled=false).");
            return;
        }

        try {
            ensureCategoriesExist();
            List<ImportedProduct> products = loadOrDownloadProducts();
            if (products.isEmpty()) {
                log.warn("No imported products available. Catalog will stay empty until data is provided.");
                return;
            }
            persistMissingProducts(products);
        } catch (Exception ex) {
            log.warn("Product import finished with errors: {}", ex.getMessage(), ex);
        }
    }

    private void ensureCategoriesExist() {
        for (ImportConfiguration.CategoryMapping mapping : importConfiguration.getCategories()) {
            findOrCreateCategory(mapping.getSakuraName(), mapping.getDescription());
        }
    }

    private List<ImportedProduct> loadOrDownloadProducts() throws IOException {
        Path localPath = Paths.get(importConfiguration.getLocalFilePath());
        ClassPathResource classpathResource = new ClassPathResource(importConfiguration.getClasspathResource());

        if (hasUsableLocalFile(localPath, classpathResource)) {
            log.info("Loading sample products from local file (no DummyJSON call).");
            return readFromAvailableSource(localPath, classpathResource);
        }

        log.info("Local sample file missing or incomplete. Fetching from DummyJSON...");
        List<ImportedProduct> downloaded = downloadFromDummyJson();
        if (downloaded.isEmpty()) {
            log.warn("DummyJSON returned no products. Keeping any existing local file if present.");
            if (classpathResource.exists() || Files.exists(localPath)) {
                return readFromAvailableSource(localPath, classpathResource);
            }
            return List.of();
        }

        saveToLocalFile(localPath, downloaded);
        return downloaded;
    }

    private boolean hasUsableLocalFile(Path localPath, ClassPathResource classpathResource) throws IOException {
        // Prefer filesystem path (updated by importer) over possibly stale classpath copy
        if (Files.exists(localPath) && Files.size(localPath) > 0) {
            try (InputStream in = Files.newInputStream(localPath)) {
                return countProducts(in) >= importConfiguration.getMinExpectedProducts();
            }
        }
        if (classpathResource.exists()) {
            try (InputStream in = classpathResource.getInputStream()) {
                return countProducts(in) >= importConfiguration.getMinExpectedProducts();
            }
        }
        return false;
    }

    private int countProducts(InputStream in) throws IOException {
        JsonNode root = objectMapper.readTree(in);
        return root.isArray() ? root.size() : 0;
    }

    private List<ImportedProduct> readFromAvailableSource(Path localPath, ClassPathResource classpathResource)
            throws IOException {
        if (Files.exists(localPath) && Files.size(localPath) > 0) {
            try (InputStream in = Files.newInputStream(localPath)) {
                return readProducts(in);
            }
        }
        try (InputStream in = classpathResource.getInputStream()) {
            return readProducts(in);
        }
    }

    private List<ImportedProduct> readProducts(InputStream in) throws IOException {
        JsonNode root = objectMapper.readTree(in);
        List<ImportedProduct> products = new ArrayList<>();
        if (!root.isArray()) {
            return products;
        }
        for (JsonNode node : root) {
            products.add(productMapper.fromJsonNode(node));
        }
        return products;
    }

    private List<ImportedProduct> downloadFromDummyJson() {
        // Deduplicate by product name across overlapping DummyJSON categories
        Map<String, ImportedProduct> byName = new LinkedHashMap<>();
        int index = 0;

        for (ImportConfiguration.CategoryMapping mapping : importConfiguration.getCategories()) {
            for (String slug : mapping.getDummyJsonSlugs()) {
                var productsNode = dummyJsonClient.fetchCategoryProducts(slug);
                if (productsNode.isEmpty()) {
                    continue;
                }
                for (JsonNode productNode : dummyJsonClient.asIterable(productsNode.get())) {
                    ImportedProduct imported = productMapper.fromDummyJson(
                            productNode,
                            mapping.getSakuraName(),
                            slug,
                            index++
                    );
                    byName.putIfAbsent(normalizeKey(imported.name()), imported);
                }
            }
        }

        List<ImportedProduct> result = new ArrayList<>(byName.values());
        log.info("Downloaded {} unique products from DummyJSON across {} Sakura categories",
                result.size(), importConfiguration.getCategories().size());
        return result;
    }

    private void saveToLocalFile(Path localPath, List<ImportedProduct> products) throws IOException {
        Files.createDirectories(localPath.getParent());
        ArrayNode array = objectMapper.createArrayNode();
        for (ImportedProduct product : products) {
            array.add(objectMapper.valueToTree(product));
        }
        try (OutputStream out = Files.newOutputStream(localPath)) {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(out, array);
        }
        log.info("Saved {} products to {}", products.size(), localPath.toAbsolutePath());
    }

    private void persistMissingProducts(List<ImportedProduct> products) {
        int inserted = 0;
        int updated = 0;
        int skipped = 0;

        for (ImportedProduct item : products) {
            if (!org.springframework.util.StringUtils.hasText(item.name())) {
                skipped++;
                continue;
            }

            var existing = productRepository.findByNameIgnoreCase(item.name());
            if (existing.isPresent()) {
                Product product = existing.get();
                // Upgrade legacy USD-like prices to Yen when needed
                if (product.getPrice() != null
                        && product.getPrice().compareTo(BigDecimal.valueOf(5000)) < 0
                        && item.price() != null
                        && item.price().compareTo(product.getPrice()) > 0) {
                    product.setPrice(item.price());
                    productRepository.save(product);
                    updated++;
                } else {
                    skipped++;
                }
                continue;
            }

            Category category = findOrCreateCategory(
                    item.categoryName(),
                    item.categoryName() + " コレクション"
            );
            Product entity = productMapper.toEntity(item, category);
            productRepository.save(entity);
            inserted++;
        }

        log.info("Product import complete: {} inserted, {} price-updated to JPY, {} skipped, {} in source file",
                inserted, updated, skipped, products.size());
    }

    private Category findOrCreateCategory(String name, String description) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    Category created = categoryRepository.save(
                            Category.builder()
                                    .name(name)
                                    .description(description)
                                    .build()
                    );
                    log.info("Created category: {}", name);
                    return created;
                });
    }

    private String normalizeKey(String name) {
        return name == null ? "" : name.trim().toLowerCase();
    }
}
