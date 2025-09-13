package org.example.sujetstage3a.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;



import jakarta.persistence.*;

/*@Entity
@Table(name = "reponse_question")
public class ReponseQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_reponse_formulaire", nullable = false)
    @JsonIgnore
    private ReponseFormulaire reponseFormulaire;


    @Column(name = "valeur")
    private String valeur;

    @Column(name = "id_question")
    private Integer idQuestion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getValeur() {
        return valeur;
    }

    public void setValeur(String valeur) {
        this.valeur = valeur;
    }

    public Integer getIdQuestion() {
        return idQuestion;
    }

    public void setIdQuestion(Integer idQuestion) {
        this.idQuestion = idQuestion;
    }

    public ReponseFormulaire getReponseFormulaire() {
        return reponseFormulaire;
    }

    public void setReponseFormulaire(ReponseFormulaire reponseFormulaire) {
        this.reponseFormulaire = reponseFormulaire;
    }
    @Transient
    private String questionLibelle;

    public String getQuestionLibelle() { return questionLibelle; }
    public void setQuestionLibelle(String questionLibelle) { this.questionLibelle = questionLibelle; }*/
@Entity
@Table(name = "reponse_question")
public class ReponseQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_reponse_formulaire", nullable = false)
    @JsonIgnore
    private ReponseFormulaire reponseFormulaire;

    @Column(name = "valeur")
    private String valeur;

    @Column(name = "id_question", nullable = false)
    @JoinColumn(name = "id_question",
            foreignKey = @ForeignKey(
                    name = "reponse_question_id_question_fkey",
                    foreignKeyDefinition = "FOREIGN KEY (id_question) REFERENCES question(id) ON DELETE CASCADE ON UPDATE CASCADE"
            ))
    private Integer idQuestion;

    @Transient
    private String questionLibelle;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ReponseFormulaire getReponseFormulaire() {
        return reponseFormulaire;
    }

    public void setReponseFormulaire(ReponseFormulaire reponseFormulaire) {
        this.reponseFormulaire = reponseFormulaire;
    }

    public String getValeur() {
        return valeur;
    }

    public void setValeur(String valeur) {
        this.valeur = valeur;
    }

    public Integer getIdQuestion() {
        return idQuestion;
    }

    public void setIdQuestion(Integer idQuestion) {
        this.idQuestion = idQuestion;
    }

    public String getQuestionLibelle() {
        return questionLibelle;
    }

    public void setQuestionLibelle(String questionLibelle) {
        this.questionLibelle = questionLibelle;
    }


}