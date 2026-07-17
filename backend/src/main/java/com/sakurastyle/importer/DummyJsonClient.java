package com.sakurastyle.importer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.Optional;

/**
 * Thin HTTP client for DummyJSON category product endpoints.
 * Failures are logged as warnings and never crash the application.
 */
@Slf4j
@Component
public class DummyJsonClient {

    private final ImportConfiguration importConfiguration;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public DummyJsonClient(ImportConfiguration importConfiguration, ObjectMapper objectMapper) {
        this.importConfiguration = importConfiguration;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(importConfiguration.getConnectTimeoutMs()))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    /**
     * @return products array node, or empty if the category could not be loaded
     */
    public Optional<JsonNode> fetchCategoryProducts(String slug) {
        String url = importConfiguration.getBaseUrl() + "/products/category/" + slug;
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofMillis(importConfiguration.getReadTimeoutMs()))
                    .GET()
                    .header("Accept", "application/json")
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int status = response.statusCode();
            if (status < 200 || status >= 300) {
                log.warn("DummyJSON category '{}' returned HTTP {}. Skipping.", slug, status);
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode products = root.get("products");
            if (products == null || !products.isArray()) {
                log.warn("DummyJSON category '{}' returned no products array. Skipping.", slug);
                return Optional.empty();
            }

            log.info("Fetched {} products from DummyJSON category '{}'", products.size(), slug);
            return Optional.of(products);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn("DummyJSON fetch interrupted for category '{}': {}", slug, ex.getMessage());
            return Optional.empty();
        } catch (Exception ex) {
            log.warn("Failed to fetch DummyJSON category '{}': {}. Skipping.", slug, ex.getMessage());
            return Optional.empty();
        }
    }

    public Iterable<JsonNode> asIterable(JsonNode productsArray) {
        if (productsArray == null || !productsArray.isArray()) {
            return Collections.emptyList();
        }
        return productsArray::elements;
    }
}
