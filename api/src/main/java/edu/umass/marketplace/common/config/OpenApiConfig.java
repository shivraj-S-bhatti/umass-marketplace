package edu.umass.marketplace.common.config;

// OpenAPI Configuration for Swagger UI
// Provides comprehensive API documentation with proper metadata and examples
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("UMass Marketplace API")
                        .description("A marketplace platform for UMass students to buy and sell items")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("UMass Marketplace Team")
                                .email("marketplace@umass.edu")
                                .url("https://github.com/shivraj-S-bhatti/umass-marketplace"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local Development Server"),
                        new Server()
                                .url("https://api.umass-marketplace.edu")
                                .description("Production Server")
                ));
    }
}
