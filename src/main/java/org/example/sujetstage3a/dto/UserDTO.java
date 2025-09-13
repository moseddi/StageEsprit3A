package org.example.sujetstage3a.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data


@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {
    private Integer id;
    private String nom;
    private String email;
    private String role;
    private String bio;
    private String avatar;

    public Integer getId() {
        return id;
    }

    public void setId(  Integer id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.role = role;
    }
    public UserDTO(Integer id, String nom, String email, String role,String bio,String avatar) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.role = role;
        this.bio = bio;
        this.avatar = avatar;
    }

    // Add no-args constructor
    public UserDTO() {}
}