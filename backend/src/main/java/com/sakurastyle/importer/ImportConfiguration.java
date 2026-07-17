package com.sakurastyle.importer;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * Category mappings from DummyJSON slugs to Sakura Style categories.
 * Note: DummyJSON uses {@code womens-jewellery} (not {@code jewellery}).
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "sakura.import")
public class ImportConfiguration {

    private boolean enabled = true;
    private String baseUrl = "https://dummyjson.com";
    private String classpathResource = "data/imported-products.json";
    private String localFilePath = "src/main/resources/data/imported-products.json";
    private int connectTimeoutMs = 15000;
    private int readTimeoutMs = 15000;
    /** Re-fetch from DummyJSON if local file has fewer products than this. */
    private int minExpectedProducts = 50;
    /** DummyJSON prices are USD-like; convert to JPY for Sakura Style. */
    private int usdToYenRate = 150;
    private List<CategoryMapping> categories = defaultCategories();

    @Getter
    @Setter
    public static class CategoryMapping {
        private String sakuraName;
        private String description;
        private List<String> dummyJsonSlugs = new ArrayList<>();

        public CategoryMapping() {
        }

        public CategoryMapping(String sakuraName, String description, List<String> dummyJsonSlugs) {
            this.sakuraName = sakuraName;
            this.description = description;
            this.dummyJsonSlugs = dummyJsonSlugs;
        }
    }

    private static List<CategoryMapping> defaultCategories() {
        List<CategoryMapping> mappings = new ArrayList<>();
        mappings.add(new CategoryMapping(
                "トップス",
                "カジュアル〜フォーマルなトップス",
                List.of("tops", "mens-shirts")
        ));
        mappings.add(new CategoryMapping(
                "ドレス",
                "デイリー＆オケージョンドレス",
                List.of("womens-dresses")
        ));
        mappings.add(new CategoryMapping(
                "アクセサリー",
                "バッグ・ジュエリー・サングラス・腕時計など",
                // DummyJSON uses womens-jewellery (not "jewellery")
                List.of(
                        "womens-bags",
                        "womens-jewellery",
                        "sunglasses",
                        "womens-watches",
                        "mens-watches",
                        "mobile-accessories",
                        "sports-accessories"
                )
        ));
        mappings.add(new CategoryMapping(
                "シューズ",
                "メンズ・レディースのシューズ",
                List.of("mens-shoes", "womens-shoes")
        ));
        mappings.add(new CategoryMapping(
                "ビューティー",
                "ビューティー・フレグランス・スキンケア",
                List.of("beauty", "fragrances", "skin-care")
        ));
        return mappings;
    }
}
