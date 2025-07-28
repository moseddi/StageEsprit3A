package com.example.SujetStage.entities;
import jakarta.persistence.*;

@Entity
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String libelle;

    @Column(nullable = false)
    private Integer bareme;

    private Float ponderation;

    @Column(nullable = false)
    private Boolean statut = true;

    // Relation avec Formulaire
    @ManyToOne
    @JoinColumn(name = "id_formulaire", referencedColumnName = "id")
    private Formulaire formulaire;

    // Getters et Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public Integer getBareme() {
        return bareme;
    }

    public void setBareme(Integer bareme) {
        this.bareme = bareme;
    }

    public Float getPonderation() {
        return ponderation;
    }

    public void setPonderation(Float ponderation) {
        this.ponderation = ponderation;
    }

    public Boolean getStatut() {
        return statut;
    }

    public void setStatut(Boolean statut) {
        this.statut = statut;
    }

    public Formulaire getFormulaire() {
        return formulaire;
    }

    public void setFormulaire(Formulaire formulaire) {
        this.formulaire = formulaire;
    }
}
