package org.example.sujetstage3a.model;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String libelle;

    @Column(nullable = false)
    private Integer bareme;

    @Column(nullable = false)
    private Double ponderation;

    @Column(nullable = false)
    private boolean statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_formulaire", nullable = false)
    private Formulaire formulaire;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    public Integer getBareme() { return bareme; }
    public void setBareme(Integer bareme) { this.bareme = bareme; }
    public Double getPonderation() { return ponderation; }
    public void setPonderation(Double ponderation) { this.ponderation = ponderation; }
    public boolean isStatut() { return statut; }
    public void setStatut(boolean statut) { this.statut = statut; }
    public Formulaire getFormulaire() { return formulaire; }
    public void setFormulaire(Formulaire formulaire) { this.formulaire = formulaire; }
}