package org.example.sujetstage3a.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "reponse_question")
@Data
public class ReponseQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String valeur;

    @ManyToOne
    @JoinColumn(name = "id_question", nullable = false)
    private Question question;

    @ManyToOne
    @JoinColumn(name = "id_reponse_formulaire", nullable = false)
    private ReponseFormulaire reponseFormulaire;
}