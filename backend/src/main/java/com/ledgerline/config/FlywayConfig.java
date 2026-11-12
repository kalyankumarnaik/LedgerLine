package com.ledgerline.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * BalanceVault Flyway Resilient Migration Configuration.
 * Automatically runs repair() before migrate() to clear any historical failed
 * migration markers in cloud databases before executing newly applied scripts.
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy repairAndMigrateStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
