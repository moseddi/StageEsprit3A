package org.example.sujetstage3a.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "formulaire")
@Data
public class Formulaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean statut = true;

    @Column(length = 50)
    private String niveau;

    @ManyToOne
    @JoinColumn(name = "id_createur", nullable = false)
    private User createur;

    @ManyToOne
    @JoinColumn(name = "id_classe", nullable = false)
    private Classe classe;

    @OneToMany(mappedBy = "formulaire")
    @JsonIgnore
    private List<Question> questions;

    @OneToMany(mappedBy = "formulaire")
    @JsonIgnore
    private List<LienEvaluation> liensEvaluation;

    @OneToMany(mappedBy = "formulaire")
    private List<ReponseFormulaire> reponses;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getStatut() {
        return statut;
    }

    public void setStatut(Boolean statut) {
        this.statut = statut;
    }

    public String getNiveau() {
        return niveau;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public User getCreateur() {
        return createur;
    }

    public void setCreateur(User createur) {
        this.createur = createur;
    }

    public Classe getClasse() {
        return classe;
    }

    public void setClasse(Classe classe) {
        this.classe = classe;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public List<LienEvaluation> getLiensEvaluation() {
        return liensEvaluation;
    }

    public void setLiensEvaluation(List<LienEvaluation> liensEvaluation) {
        this.liensEvaluation = liensEvaluation;
    }

    public List<ReponseFormulaire> getReponses() {
        return reponses;
    }

    public void setReponses(List<ReponseFormulaire> reponses) {
        this.reponses = reponses;
    }
}