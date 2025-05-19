package org.sstec.resourceserver;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/public")
    public String publicEndpoint() {
        return "This is a public endpoint, accessible by anyone.";
    }

    @GetMapping("/products/view")
    // @PreAuthorize("hasAuthority('SCOPE_product:read')") // Alternative to HttpSecurity config
    public String viewProducts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return "User '" + authentication.getName() + "' can VIEW products. Authorities: " + authentication.getAuthorities();
    }

    @GetMapping("/products/edit")
    // @PreAuthorize("hasAuthority('SCOPE_product:write')") // Alternative to HttpSecurity config
    public String editProducts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return "User '" + authentication.getName() + "' can EDIT products. Authorities: " + authentication.getAuthorities();
    }

    @GetMapping("/userinfo")
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal Jwt principal) {
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Jwt principal = (Jwt) authentication.getPrincipal();
        return Map.of(
                "username", principal.getSubject(),
                "claims", principal.getClaims(),
                "authorities", SecurityContextHolder.getContext().getAuthentication().getAuthorities()
        );
    }
}