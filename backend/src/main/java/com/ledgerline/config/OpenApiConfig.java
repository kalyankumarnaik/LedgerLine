package com.ledgerline.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ledgerLineOpenAPI() {
        final String securitySchemeName = "BearerAuthentication";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components().addSecuritySchemes(securitySchemeName,
                        new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Input JWT access token.")))
                .info(new Info()
                        .title("LedgerLine Financial Core API")
                        .description("Every movement accounted for. Every balance proven. Production-grade double-entry ledger and money movement platform.")
                        .version("1.0.0")
                        .contact(new Contact().name("LedgerLine Architecture Team").email("security@ledgerline.com"))
                        .license(new License().name("Proprietary").url("https://ledgerline.com/terms")));
    }
}
