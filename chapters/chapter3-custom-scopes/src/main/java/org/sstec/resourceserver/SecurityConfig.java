package org.sstec.resourceserver;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true, prePostEnabled = true) // To enable @PreAuthorize
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers("/api/public").permitAll()
                                .requestMatchers("/api/products/view").hasAuthority("SCOPE_product:read")
                                .requestMatchers("/api/products/edit").hasAuthority("SCOPE_product:write")
                                .requestMatchers("/api/userinfo").authenticated() // Any authenticated user
                                .anyRequest().authenticated() // All other /api/** endpoints require authentication
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                )
                .oauth2Login(oauth2Login -> // Optional: If you want this app to also be an OAuth2 client
                        oauth2Login.defaultSuccessUrl("/api/userinfo")
                ); // Add this if you want to test login via this app

        return http.build();
    }

    // Custom JWT converter to map Keycloak roles and scopes to Spring Security authorities
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRealmRoleAndScopeConverter());
        return converter;
    }
}

// Converter to extract realm roles and client scopes and prefix them for Spring Security
class KeycloakRealmRoleAndScopeConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        // Extract realm_access.roles
        List<GrantedAuthority> realmRoles = ((Map<String, List<String>>) jwt.getClaim("realm_access"))
                .getOrDefault("roles", List.of())
                .stream()
                .map(roleName -> "ROLE_" + roleName) // Prefix with ROLE_
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        // Extract scope claim (space-separated string)
        String scopeClaim = jwt.getClaimAsString("scope");
        List<GrantedAuthority> scopes = Stream.of(scopeClaim != null ? scopeClaim.split(" ") : new String[0])
                .map(scopeName -> "SCOPE_" + scopeName) // Prefix with SCOPE_
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        // Extract resource_access.<client_id>.roles (client roles)
        // Example: spring.security.oauth2.client.registration.keycloak.client-id=spring-boot-app
        // You might need to make client-id configurable or discover it. For now, hardcoding for demo.
        String clientId = "spring-boot-app"; // Or fetch from properties
        Map<String, Map<String, List<String>>> resourceAccess = jwt.getClaim("resource_access");
        List<GrantedAuthority> clientRoles = List.of();
        if (resourceAccess != null && resourceAccess.containsKey(clientId)) {
            clientRoles = resourceAccess.get(clientId).getOrDefault("roles", List.of())
                    .stream()
                    .map(roleName -> "ROLE_CLIENT_" + roleName.toUpperCase()) // Prefix with ROLE_CLIENT_
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        }


        // Combine all authorities
        return Stream.concat(Stream.concat(realmRoles.stream(), scopes.stream()), clientRoles.stream())
                .collect(Collectors.toList());
    }
}