package org.example.sujetstage3a.dto;

import lombok.Data;

@Data
public class ReponseQuestionDTO {
    private Long id;
    private String valeur;
    private Long idQuestion;
    private Long idReponseFormulaire;
}