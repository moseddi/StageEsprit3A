package org.example.sujetstage3a.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "reponse_formulaire")
@Data
public class ReponseFormulaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "note_global")
    private Float noteGlobal;

    @ManyToOne
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private User utilisateur;

    @ManyToOne
    @JoinColumn(name = "id_formulaire", nullable = false)
    private Formulaire formulaire;

    /*@OneToMany(mappedBy = "reponseFormulaire")
    private List<ReponseQuestion> reponsesQuestions;*/
}