package org.example.sujetstage3a.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LienEvaluationDTO {
    private Long id;
    private String token;
    private LocalDateTime expiration;
    private Long idFormulaire;
}