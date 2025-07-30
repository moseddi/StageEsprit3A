package org.example.sujetstage3a.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reponse_formulaire")
public class ReponseFormulaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_formulaire")
    private Integer formulaireId;

    @Column(name = "commentaire")
    private String commentaire;

    @Column(name = "note_global")
    private Float noteGlobal;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getFormulaireId() {
        return formulaireId;
    }

    public void setFormulaireId(Integer formulaireId) {
        this.formulaireId = formulaireId;
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
}