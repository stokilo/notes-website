package org.sstec.resourceserver;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RestaurantController {

    @GetMapping("/menu/public")
    public Map<String, String> getPublicMenu() {
        return Map.of("dishOfTheDay", "Pizza Margherita", "status", "Publicly available");
    }

    @GetMapping("/orders/my-orders")
    public List<String> getMyOrders(Principal principal) {
        // Principal zawiera informacje o zalogowanym użytkowniku z tokenu JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = principal.getName(); // Z JWT, zazwyczaj to 'preferred_username'

        return Arrays.asList(
                "Order 1 for " + username + ": Coffee",
                "Order 2 for " + username + ": Sandwich"
        );
    }

    // Endpoint do testowania informacji o użytkowniku
    @GetMapping("/me")
    public Object getMe(Authentication authentication) {
        return authentication;
    }
}
