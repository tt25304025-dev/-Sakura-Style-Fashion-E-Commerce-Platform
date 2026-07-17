package com.sakurastyle.config;

import com.sakurastyle.importer.ImportConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ImportConfiguration.class)
public class ImportConfig {
}
