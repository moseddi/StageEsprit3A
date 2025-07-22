package org.example.sujetstage3a.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lien_evaluation")
public class LienEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String token;

    private LocalDateTime expiration;

    @ManyToOne
    @JoinColumn(name = "id_formulaire")
    private Formulaire formulaire;

    // Getters and Setters
    public Integer getId() { return id; }

    public String getToken() { return token; }

    public void setToken(String token) { this.token = token; }

    public LocalDateTime getExpiration() { return expiration; }

    public void setExpiration(LocalDateTime expiration) { this.expiration = expiration; }

    public Formulaire getFormulaire() { return formulaire; }

    public void setFormulaire(Formulaire formulaire) { this.formulaire = formulaire; }
}
