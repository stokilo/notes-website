package org.sstec.resourceserver;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/public/info")
    public String publicInfo() {
        return "This is public information, accessible to anyone!";
    }

    @GetMapping("/hello")
    public String hello(Authentication authentication) {
        String username = authentication.getName();
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(", "));
        return "Hello, " + username + "! Your authorities are: [" + authorities + "]";
    }

    @GetMapping("/user/data")
    public String userData(@AuthenticationPrincipal Jwt jwt) {
        return "Hello, " + jwt.getClaimAsString("preferred_username") + "! This is USER specific data. Your roles from token: " + jwt.getClaimAsStringList("realm_access.roles");
    }

    @GetMapping("/admin/data")
    public String adminData(@AuthenticationPrincipal Jwt jwt) {
        return "Hello, " + jwt.getClaimAsString("preferred_username") + "! This is ADMIN specific data. Your roles from token: " + jwt.getClaimAsStringList("realm_access.roles");
    }

    // Example using @PreAuthorize (requires @EnableMethodSecurity)
    // @PreAuthorize("hasRole('APP_ADMIN')")
    // @GetMapping("/admin/advanced")
    // public String adminAdvancedData() {
    //     return "This is advanced ADMIN data secured with @PreAuthorize!";
    // }
}