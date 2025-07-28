package com.example.SujetStage.dto;

import com.example.SujetStage.entities.User;
import java.util.Base64;

public class UserResponseDto {
    private String nom;
    private String email;
    private String adresse;
    private String identite;
    private String photo; // base64
    private String role;

    public UserResponseDto(User user) {
        this.nom = user.getNom();
        this.email = user.getEmail();
        this.adresse = user.getAdresse();
        this.identite = user.getIdentite();
        this.role = user.getRole();
        this.photo = (user.getPhoto() != null) ?
                "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(user.getPhoto()) : null;
    }

    // Getters uniquement
    public String getNom() { return nom; }
    public String getEmail() { return email; }
    public String getAdresse() { return adresse; }
    public String getIdentite() { return identite; }
    public String getPhoto() { return photo; }
    public String getRole() { return role; }
}
