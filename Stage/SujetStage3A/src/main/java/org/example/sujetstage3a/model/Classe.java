package org.example.sujetstage3a.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "classe")
@Data
public class Classe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;  // Matches SERIAL in SQL

    @Column(nullable = false, length = 50)
    private String nom;  // Matches VARCHAR(50) NOT NULL

    // No need for etudiants/formulaires here (handled by other tables)

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }
}