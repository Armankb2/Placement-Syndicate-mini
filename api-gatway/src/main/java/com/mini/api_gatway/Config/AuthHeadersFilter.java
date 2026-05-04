package com.mini.api_gatway.Config;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.server.ServerWebExchange;

@Configuration
public class AuthHeadersFilter {

    @Bean
    public GlobalFilter userHeadersGlobalFilter() {
        return (exchange, chain) -> ReactiveSecurityContextHolder.getContext()
                .map(securityContext -> securityContext.getAuthentication())
                .cast(JwtAuthenticationToken.class)
                .map(JwtAuthenticationToken::getToken)
                .map(jwt -> mutateExchange(exchange, jwt))
                .defaultIfEmpty(exchange)
                .flatMap(chain::filter);
    }

    private ServerWebExchange mutateExchange(ServerWebExchange exchange, Jwt jwt) {
        return exchange.mutate()
                .request(request -> request.headers(headers -> {
                    headers.set("X-User-Id", jwt.getSubject());
                    headers.set("X-User-Email", jwt.getClaimAsString("email"));
                    headers.set("X-User-Name", jwt.getClaimAsString("name"));
                    headers.set("X-User-Role", jwt.getClaimAsString("role"));
                }))
                .build();
    }
}
