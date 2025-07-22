package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FormulaireService {

    private final FormulaireRepository formulaireRepository;

    @Autowired
    public FormulaireService(FormulaireRepository formulaireRepository) {
        this.formulaireRepository = formulaireRepository;
    }

    public List<Formulaire> getAllFormulaires() {
        return formulaireRepository.findAll();
    }

    public Page<Formulaire> getAllFormulairesPageable(Pageable pageable) {
        return formulaireRepository.findAll(pageable);
    }

    public Optional<Formulaire> getFormulaireById(Integer id) {
        return formulaireRepository.findById(id);
    }

    public Formulaire createFormulaire(Formulaire formulaire) {
        return formulaireRepository.save(formulaire);
    }

    public Formulaire updateFormulaire(Integer id, Formulaire formulaireDetails) {
        Formulaire formulaire = formulaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));
        formulaire.setTitre(formulaireDetails.getTitre());
        formulaire.setNiveau(formulaireDetails.getNiveau());
        formulaire.setDescription(formulaireDetails.getDescription());
        formulaire.setStatut(formulaireDetails.getStatut());
        return formulaireRepository.save(formulaire);
    }

    public void deleteFormulaire(Integer id) {
        formulaireRepository.deleteById(id);
    }
}
