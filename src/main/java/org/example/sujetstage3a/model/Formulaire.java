package org.example.sujetstage3a.model;

import jakarta.persistence.*;

@Entity
@Table(name = "formulaire")
public class Formulaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "titre", nullable = false)
    private String titre;

    @Column(name = "niveau", nullable = false)
    private String niveau;

    @Column(name = "description")
    private String description;

    @Column(name = "statut")
    private Boolean statut = true;

    @ManyToOne
    @JoinColumn(name = "id_createur", referencedColumnName = "id")
    private User createur;

    // Getters
    public Integer getId() {
        return id;
    }

    public String getTitre() {
        return titre;
    }

    public String getNiveau() {
        return niveau;
    }

    public String getDescription() {
        return description;
    }

    public Boolean getStatut() {
        return statut;
    }

    public User getCreateur() {
        return createur;
    }

    // Setters
    public void setId(Integer id) {
        this.id = id;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStatut(Boolean statut) {
        this.statut = statut;
    }

    public void setCreateur(User createur) {
        this.createur = createur;
    }
}