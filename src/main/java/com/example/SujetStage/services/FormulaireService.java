package com.example.SujetStage.services;

import com.example.SujetStage.entities.Formulaire;
import com.example.SujetStage.repositories.FormulaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FormulaireService {

    @Autowired
    private FormulaireRepository formulaireRepository;

    // Récupérer tous les formulaires
    public List<Formulaire> getAllFormulaires() {
        return formulaireRepository.findAll();
    }

    // Récupérer un formulaire par ID
    public Optional<Formulaire> getFormulaireById(Integer id) {
        return formulaireRepository.findById(id);
    }

    // Créer un formulaire
    public Formulaire createFormulaire(Formulaire formulaire) {
        return formulaireRepository.save(formulaire);
    }

    // Mettre à jour un formulaire
    public Optional<Formulaire> updateFormulaire(Integer id, Formulaire formulaireDetails) {
        return formulaireRepository.findById(id).map(formulaire -> {
            formulaire.setTitre(formulaireDetails.getTitre());
            formulaire.setDescription(formulaireDetails.getDescription());
            formulaire.setStatut(formulaireDetails.getStatut());
            formulaire.setNiveau(formulaireDetails.getNiveau());
            formulaire.setClasse(formulaireDetails.getClasse());
            return formulaireRepository.save(formulaire);
        });
    }

    // Supprimer un formulaire
    public boolean deleteFormulaire(Integer id) {
        return formulaireRepository.findById(id).map(formulaire -> {
            formulaireRepository.delete(formulaire);
            return true;
        }).orElse(false);
    }

    // Récupérer par statut
    public List<Formulaire> getFormulairesByStatut(Boolean statut) {
        return formulaireRepository.findByStatut(statut);
    }

    // Récupérer par niveau
    public List<Formulaire> getFormulairesByNiveau(String niveau) {
        return formulaireRepository.findByNiveau(niveau);
    }

    // Récupérer par classe
    public List<Formulaire> getFormulairesByClasse(Integer classeId) {
        return formulaireRepository.findByClasseId(classeId);
    }
}
