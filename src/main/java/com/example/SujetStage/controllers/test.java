package com.example.SujetStage.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@RestController
public class test {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/test-db")
    public String testDb() {
        try (Connection conn = dataSource.getConnection()) {
            return "✅ Connexion à la base de données réussie !";
        } catch (SQLException e) {
            return "❌ Échec de connexion à la base de données : " + e.getMessage();
        }
    }
}
