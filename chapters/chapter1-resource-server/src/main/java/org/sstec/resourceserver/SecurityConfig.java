package org.sstec.resourceserver;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true) // Umożliwia @RolesAllowed
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers("/api/menu/public").permitAll()
                                .requestMatchers("/api/orders/my-orders").hasRole("customer") // Oczekuje roli 'ROLE_customer'
                                .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );
        return http.build();
    }

    // Konwerter do mapowania ról z JWT na GrantedAuthority w Spring Security
    // Domyślnie Spring Security szuka ról w claimie 'scope' lub 'scp'.
    // Keycloak umieszcza role realmu w 'realm_access.roles', a role klienta w 'resource_access.<client_id>.roles'.
    // Ten konwerter zapewni, że role z Keycloak będą poprawnie interpretowane (z prefiksem ROLE_).
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // Usuń domyślny prefiks "SCOPE_" (jeśli jest)
        grantedAuthoritiesConverter.setAuthorityPrefix("");
        // Ustaw prefiks "ROLE_" dla ról, aby zgadzało się z hasRole("customer")
        // Jeśli twoje role w Keycloak są już np. "ROLE_customer", możesz pominąć setAuthorityPrefix("ROLE_")
        // i używać grantedAuthoritiesConverter.setAuthoritiesClaimName("realm_access.roles");
        // ale dla prostoty zostawiamy domyślne działanie i dodajemy ROLE_ ręcznie.

        // W nowszych wersjach Spring Security można tak skonfigurować, aby prefiks "ROLE_" był dodawany automatycznie
        // do wartości z określonego claimu.
        // Dla uproszczenia, jeśli role w Keycloak to 'customer', 'admin',
        // to chcemy, aby Spring Security widział je jako 'ROLE_customer', 'ROLE_admin'.
        // Standardowy JwtGrantedAuthoritiesConverter może nie dodawać 'ROLE_' prefixu automatycznie
        // do ról z claimów innych niż 'scope'.
        // Poniższy sposób jest bardziej jawny i elastyczny.

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var authorities = grantedAuthoritiesConverter.convert(jwt); // Pobiera scope'y
            var realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null) {
                var roles = (java.util.Collection<String>) realmAccess.get("roles");
                if (roles != null) {
                    roles.stream()
                            .map(roleName -> "ROLE_" + roleName) // Dodajemy prefiks ROLE_
                            .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                            .forEach(authorities::add);
                }
            }
            return authorities;
        });

        return jwtAuthenticationConverter;
    }
}
