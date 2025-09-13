package org.example.sujetstage3a.model;

import jakarta.persistence.*;

import java.util.List;

/*@Entity
@Table(name = "reponse_formulaire")
public class ReponseFormulaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "commentaire")
    private String commentaire;

    @Column(name = "note_global")
    private Float noteGlobal;

    @Column(name = "id_utilisateur")
    private Integer idUtilisateur;

    @Column(name = "id_formulaire")
    private Integer idFormulaire;
    @OneToMany(mappedBy = "reponseFormulaire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReponseQuestion> reponsesQuestions;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public Float getNoteGlobal() {
        return noteGlobal;
    }

    public void setNoteGlobal(Float noteGlobal) {
        this.noteGlobal = noteGlobal;
    }

    public Integer getIdUtilisateur() {
        return idUtilisateur;
    }

    public void setIdUtilisateur(Integer idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    public Integer getIdFormulaire() {
        return idFormulaire;
    }

    public void setIdFormulaire(Integer idFormulaire) {
        this.idFormulaire = idFormulaire;
    }
    public List<ReponseQuestion> getReponsesQuestions() {
        return reponsesQuestions;
    }

    public void setReponsesQuestions(List<ReponseQuestion> reponsesQuestions) {
        this.reponsesQuestions = reponsesQuestions;
    }
    @Transient
    private String titreFormulaire; // pour afficher le titre

    public String getTitreFormulaire() { return titreFormulaire; }
    public void setTitreFormulaire(String titreFormulaire) { this.titreFormulaire = titreFormulaire; }*/

@Entity
@Table(name = "reponse_formulaire")
public class ReponseFormulaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "commentaire")
    private String commentaire;

    @Column(name = "note_global")
    private Float noteGlobal;

    @Column(name = "id_utilisateur")
    private Integer idUtilisateur;

    @Column(name = "id_formulaire", nullable = false)
    @JoinColumn(name = "id_formulaire",
            foreignKey = @ForeignKey(
                    name = "reponse_formulaire_id_formulaire_fkey",
                    foreignKeyDefinition = "FOREIGN KEY (id_formulaire) REFERENCES formulaire(id) ON DELETE CASCADE ON UPDATE CASCADE"
            ))
    private Integer idFormulaire;

    @OneToMany(mappedBy = "reponseFormulaire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReponseQuestion> reponsesQuestions;

    @Transient
    private String titreFormulaire;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public Float getNoteGlobal() {
        return noteGlobal;
    }

    public void setNoteGlobal(Float noteGlobal) {
        this.noteGlobal = noteGlobal;
    }

    public Integer getIdUtilisateur() {
        return idUtilisateur;
    }

    public void setIdUtilisateur(Integer idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    public Integer getIdFormulaire() {
        return idFormulaire;
    }

    public void setIdFormulaire(Integer idFormulaire) {
        this.idFormulaire = idFormulaire;
    }

    public List<ReponseQuestion> getReponsesQuestions() {
        return reponsesQuestions;
    }

    public void setReponsesQuestions(List<ReponseQuestion> reponsesQuestions) {
        this.reponsesQuestions = reponsesQuestions;
    }

    public String getTitreFormulaire() {
        return titreFormulaire;
    }

    public void setTitreFormulaire(String titreFormulaire) {
        this.titreFormulaire = titreFormulaire;
    }


}