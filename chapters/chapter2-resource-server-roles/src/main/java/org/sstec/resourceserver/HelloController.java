package org.sstec.resourceserver;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public String hello(Authentication authentication) {
        // The Authentication object will be a JwtAuthenticationToken
        // You can access details from it:
        String username = authentication.getName(); // Usually the 'sub' claim or preferred_username
        return "Hello, " + username + "! Your authorities are: " + authentication.getAuthorities();
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        // @AuthenticationPrincipal injects the JWT itself
        // You can access all claims from the JWT
        return jwt.getClaims();
    }

    // Another way to get the principal, often gives just the username (sub claim)
    @GetMapping("/principal")
    public String principal(Principal principal) {
        return "Hello, " + principal.getName();
    }
}