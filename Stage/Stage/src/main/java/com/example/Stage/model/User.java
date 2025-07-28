package com.example.Stage.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "\"User\"") // Changed from "User"
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role; // ADMIN, TEACHER, EVALUATOR

    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    private List<Form> createdForms;

    @OneToMany(mappedBy = "evaluator", cascade = CascadeType.ALL)
    private List<Evaluation> evaluations;

    // Constructors
    public User() {}

    public User(String name, String email, String role, String password) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.password = password;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public List<Form> getCreatedForms() { return createdForms; }
    public void setCreatedForms(List<Form> createdForms) { this.createdForms = createdForms; }
    public List<Evaluation> getEvaluations() { return evaluations; }
    public void setEvaluations(List<Evaluation> evaluations) { this.evaluations = evaluations; }

    // Helper methods
    public boolean isAdmin() { return "ADMIN".equals(role); }
    public boolean isTeacher() { return "TEACHER".equals(role); }
    public boolean isEvaluator() { return "EVALUATOR".equals(role); }
}
