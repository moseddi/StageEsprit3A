package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FormulaireService {
    private final FormulaireRepository formulaireRepository;

    public FormulaireService(FormulaireRepository formulaireRepository) {
        this.formulaireRepository = formulaireRepository;
    }

    public List<Formulaire> getAllFormulaires() {
        return formulaireRepository.findAll();
    }

    public List<Formulaire> getFormulairesByCreatorId(Integer creatorId) {
        return formulaireRepository.findByCreateurId(creatorId);
    }

    public Formulaire getFormulaireById(Integer id) {
        return formulaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formulaire not found with id: " + id));
    }

    public Formulaire createFormulaire(Formulaire formulaire) {
        if (formulaire.getCreateur() == null) {
            throw new IllegalArgumentException("Form must have a creator");
        }
        return formulaireRepository.save(formulaire);
    }

    public Formulaire updateFormulaire(Integer id, Formulaire formulaireDetails) {
        Formulaire formulaire = getFormulaireById(id);

        formulaire.setTitre(formulaireDetails.getTitre());
        formulaire.setDescription(formulaireDetails.getDescription());
        formulaire.setStatut(formulaireDetails.getStatut());
        formulaire.setNiveau(formulaireDetails.getNiveau());
        formulaire.setClasse(formulaireDetails.getClasse());

        return formulaireRepository.save(formulaire);
    }

    public void deleteFormulaire(Integer id) {
        formulaireRepository.deleteById(id);
    }
}