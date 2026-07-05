package com.samir.api_gateway.filter;


import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;


@Component
@AllArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final WebClient.Builder builder;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        LOGGER.info("Incoming request: {}", exchange.getRequest().getURI());

        // Only bypass JWT for public auth endpoints — protected routes like /auth/account must go through the filter
        boolean isPublicAuthPath =
                path.equals("/auth/login") ||
                path.equals("/auth/register") ||
                path.equals("/auth/refresh") ||
                path.equals("/auth/logout") ||
                path.equals("/auth/verify") ||
                path.startsWith("/auth/oauth2") ||
                path.startsWith("/login/oauth2") ||
                path.startsWith("/oauth2");

        if (isPublicAuthPath) {
            return chain.filter(exchange);
        }


        String authHeader = exchange.getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);

            ServerWebExchange modifiedExchange = exchange.mutate()
                    .request(builder -> builder
                            .header("X-User-Email", email)
                            .header("X-User-Role", role)
                            .header("X-Gateway-Source", "API-GATEWAY")
                    )
                    .build();

            LOGGER.info("User authenticated: {} with role: {}", email, role);
            return chain.filter(modifiedExchange);
        }
        catch(Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);

            LOGGER.error("Unauthorized request: {}", path);
            return exchange.getResponse().setComplete();
        }
    }
}
