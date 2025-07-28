package com.example.Stage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DbTestController {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/test-db")
    public String testDb() {
        try {
            jdbcTemplate.execute("SELECT 1");
            return "DATABASE CONNECTION WORKS!";  // Simple success message
        } catch (Exception e) {
            return "DATABASE CONNECTION FAILED: " + e.getMessage();
        }
    }
}