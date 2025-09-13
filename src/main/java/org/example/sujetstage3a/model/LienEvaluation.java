package org.example.sujetstage3a.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "lien_evaluation")
public class LienEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false)
    private String token;

    @Column(name = "expiration")
    private Timestamp expiration;

    @Column(name = "id_formulaire", nullable = false)
    @JoinColumn(name = "id_formulaire",
            foreignKey = @ForeignKey(
                    name = "lien_evaluation_id_formulaire_fkey",
                    foreignKeyDefinition = "FOREIGN KEY (id_formulaire) REFERENCES formulaire(id) ON DELETE CASCADE ON UPDATE CASCADE"
            ))
    private Integer idFormulaire;

    @Column(name = "id_evaluateur")
    private Integer idEvaluateur;

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Timestamp getExpiration() {
        return expiration;
    }

    public void setExpiration(Timestamp expiration) {
        this.expiration = expiration;
    }

    public Integer getIdFormulaire() {
        return idFormulaire;
    }

    public void setIdFormulaire(Integer idFormulaire) {
        this.idFormulaire = idFormulaire;
    }

    public Integer getIdEvaluateur() {
        return idEvaluateur;
    }

    public void setIdEvaluateur(Integer idEvaluateur) {
        this.idEvaluateur = idEvaluateur;
    }
}