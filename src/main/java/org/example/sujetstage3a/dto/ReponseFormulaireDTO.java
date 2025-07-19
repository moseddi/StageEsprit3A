package org.example.sujetstage3a.dto;

import lombok.Data;

import java.util.List;

@Data
public class ReponseFormulaireDTO {
    private Long id;
    private String commentaire;
    private Float noteGlobal;
    private Long idUtilisateur;
    private Long idFormulaire;
    private List<Long> reponseQuestionIds;
}