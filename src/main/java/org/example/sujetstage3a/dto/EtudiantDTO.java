package org.example.sujetstage3a.dto;

import lombok.Data;

@Data
public class EtudiantDTO {
    private Long id;
    private String nom;
    private String email;
    private Long idClasse;
}