package org.example.sujetstage3a.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.ResultSet;

@CrossOrigin(origins = {
        "http://localhost:3000",          // React development server
        "http://127.0.0.1:3000",         // Alternative localhost
        "http://your-production-url.com"  // Add your production URL when ready
})
@RestController
@RequestMapping("/api/db-test")
public class TestController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/connection")
    public String testConnection() {
        try (Connection conn = dataSource.getConnection()) {
            return "✅ PostgreSQL connection successful!";
        } catch (SQLException e) {
            // Enhanced error logging
            System.err.println("Database connection error:");
            e.printStackTrace();
            return "❌ Connection failed: " + e.getMessage() +
                    " (Error code: " + e.getErrorCode() + ")";
        }
    }

    @GetMapping("/version")
    public String getPostgresVersion() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT version()")) {

            if (rs.next()) {
                String version = rs.getString(1);
                System.out.println("PostgreSQL version: " + version); // Log version
                return "PostgreSQL version: " + version;
            }
            return "No version information returned";

        } catch (SQLException e) {
            System.err.println("Version query error:");
            e.printStackTrace();
            return "Error retrieving version: " + e.getMessage() +
                    " (SQL State: " + e.getSQLState() + ")";
        }
    }

    // Additional test endpoint
    @GetMapping("/status")
    public String fullStatusCheck() {
        String connectionStatus = testConnection();
        String versionStatus = getPostgresVersion();

        return String.format(
                "Full Status Report:%nConnection: %s%nVersion: %s",
                connectionStatus,
                versionStatus
        );
    }
}