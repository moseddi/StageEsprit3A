package org.example.sujetstage3a.dto;

import lombok.Data;

@Data
public class QuestionDTO {
    private Long id;
    private String libelle;
    private Integer bareme;
    private Float ponderation;
    private Boolean statut;
    private Long idFormulaire;
}