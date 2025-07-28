package org.example.sujetstage3a.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "question")
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String libelle;

    @Column(nullable = false)
    private Integer bareme;

    private Float ponderation;

    @Column(nullable = false)
    private Boolean statut = true;

    @ManyToOne
    @JoinColumn(name = "id_formulaire", nullable = false)
    @JsonIgnoreProperties({"questions", "liensEvaluation", "reponses"})
    private Formulaire formulaire;

    @OneToMany(mappedBy = "question")
    @JsonIgnore
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<ReponseQuestion> reponses;

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

    public List<ReponseQuestion> getReponses() {
        return reponses;
    }

    public void setReponses(List<ReponseQuestion> reponses) {
        this.reponses = reponses;
    }
}