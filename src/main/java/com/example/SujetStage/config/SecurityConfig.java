package com.example.SujetStage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // désactive CSRF pour faciliter les tests API
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/**").permitAll() // autorise toutes les requêtes vers /api/users/** sans authentification
                        .anyRequest().authenticated() // toutes les autres requêtes requièrent authentification
                )
                .httpBasic(withDefaults -> {}); // tu peux aussi enlever cette ligne si tu veux

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
