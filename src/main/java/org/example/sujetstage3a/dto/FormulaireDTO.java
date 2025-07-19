package org.example.sujetstage3a.dto;

import lombok.Data;

import java.util.List;

@Data
public class FormulaireDTO {
    private Long id;
    private String titre;
    private String description;
    private Boolean statut;
    private String niveau;
    private Long idCreateur;
    private Long idClasse;
    private List<Long> questionIds;
}