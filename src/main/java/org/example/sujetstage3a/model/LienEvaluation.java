package org.example.sujetstage3a.model;

import jakarta.persistence.*;
import org.example.sujetstage3a.model.Formulaire;

import java.time.LocalDateTime;

@Entity
@Table(name = "lien_evaluations")
public class LienEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_formulaire", nullable = false)
    private Formulaire formulaire;

    @Column
    private LocalDateTime expiration;

    @Column(nullable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Formulaire getFormulaire() { return formulaire; }
    public void setFormulaire(Formulaire formulaire) { this.formulaire = formulaire; }
    public LocalDateTime getExpiration() { return expiration; }
    public void setExpiration(LocalDateTime expiration) { this.expiration = expiration; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}