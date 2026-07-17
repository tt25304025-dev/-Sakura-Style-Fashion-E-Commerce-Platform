package com.sakurastyle.service;

import com.sakurastyle.dto.ProductRequest;
import com.sakurastyle.dto.ProductResponse;
import com.sakurastyle.entity.Category;
import com.sakurastyle.entity.Product;
import com.sakurastyle.entity.ProductStatus;
import com.sakurastyle.exception.ResourceNotFoundException;
import com.sakurastyle.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    public Page<ProductResponse> search(String keyword, Long categoryId, Pageable pageable) {
        // Never pass null keyword/categoryId — PostgreSQL + Hibernate can bind null as bytea
        // and break LOWER()/LIKE. Empty string = no search, 0 = all categories.
        String searchKeyword = StringUtils.hasText(keyword) ? keyword.trim() : "";
        Long categoryFilter = categoryId != null ? categoryId : 0L;
        return productRepository
                .searchProducts(searchKeyword, categoryFilter, ProductStatus.ACTIVE, pageable)
                .map(this::toResponse);
    }

    public ProductResponse getById(Long id) {
        return toResponse(findProduct(id));
    }

    public Page<ProductResponse> getAllForAdmin(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Category category = categoryService.findCategory(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .imageUrl(request.getImageUrl())
                .stockQuantity(request.getStockQuantity())
                .size(request.getSize())
                .color(request.getColor())
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE)
                .build();

        applyStockStatus(product);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findProduct(id);
        Category category = categoryService.findCategory(request.getCategoryId());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
        product.setStockQuantity(request.getStockQuantity());
        product.setSize(request.getSize());
        product.setColor(request.getColor());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        applyStockStatus(product);

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = findProduct(id);
        productRepository.delete(product);
    }

    public Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private void applyStockStatus(Product product) {
        if (product.getStockQuantity() != null && product.getStockQuantity() == 0
                && product.getStatus() == ProductStatus.ACTIVE) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        }
    }

    public ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .imageUrl(product.getImageUrl())
                .stockQuantity(product.getStockQuantity())
                .size(product.getSize())
                .color(product.getColor())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
