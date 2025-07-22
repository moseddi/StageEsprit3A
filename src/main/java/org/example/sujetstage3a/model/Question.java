package org.example.sujetstage3a.model;

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

    private Boolean statut = true;

    @ManyToOne
    @JoinColumn(name = "id_formulaire")
    private Formulaire formulaire;

    // Getters & Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public Integer getBareme() { return bareme; }
    public void setBareme(Integer bareme) { this.bareme = bareme; }

    public Float getPonderation() { return ponderation; }
    public void setPonderation(Float ponderation) { this.ponderation = ponderation; }

    public Boolean getStatut() { return statut; }
    public void setStatut(Boolean statut) { this.statut = statut; }

    public Formulaire getFormulaire() { return formulaire; }
    public void setFormulaire(Formulaire formulaire) { this.formulaire = formulaire; }
}
