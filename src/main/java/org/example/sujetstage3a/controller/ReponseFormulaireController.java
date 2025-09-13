package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.model.Question;
import org.example.sujetstage3a.model.ReponseFormulaire;
import org.example.sujetstage3a.model.ReponseQuestion;
import org.example.sujetstage3a.repository.*;
import org.example.sujetstage3a.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluation")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ReponseFormulaireController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ReponseFormulaireRepository reponseFormulaireRepository;
    @Autowired
    private FormulaireRepository formulaireRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private LienEvaluationRepository lienEvaluationRepository;
    @Autowired
    private ReponseQuestionRepository reponseQuestionRepository;
    @Autowired
    private EvaluationService evaluationService;

    // ✅ 1. Récupérer toutes les réponses d'un évaluateur
    @GetMapping("/mes-reponses/{userId}")
    public List<ReponseFormulaire> getMesReponses(@PathVariable Integer userId) {
        System.out.println("🔍 API appelée avec userId = " + userId);
        return reponseFormulaireRepository.findByIdUtilisateur(userId);
    }

    // ✅ 2. Récupérer toutes les réponses avec les questions associées (uniquement pour l’utilisateur connecté)
    @GetMapping("/mes-reponses-detail/{userId}")
    public ResponseEntity<?> getMesReponsesDetail(@PathVariable Integer userId) {
        System.out.println("🔎 Chargement des réponses pour userId=" + userId);

        // Récupération des réponses filtrées par utilisateur
        List<ReponseFormulaire> reponses = reponseFormulaireRepository.findByIdUtilisateur(userId);
        System.out.println("📌 Nb réponses trouvées pour userId=" + userId + " => " + reponses.size());

        for (ReponseFormulaire rep : reponses) {
            // Titre du formulaire
            if (rep.getIdFormulaire() != null) {
                formulaireRepository.findById(rep.getIdFormulaire())
                        .ifPresent(form -> rep.setTitreFormulaire(form.getTitre()));
            } else {
                rep.setTitreFormulaire("Formulaire inconnu");
            }

            // Récupération des réponses aux questions
            List<ReponseQuestion> questionsRep = reponseQuestionRepository.findByReponseFormulaireId(rep.getId());
            for (ReponseQuestion rq : questionsRep) {
                if (rq.getIdQuestion() != null) {
                    questionRepository.findById(rq.getIdQuestion())
                            .ifPresent(q -> rq.setQuestionLibelle(q.getLibelle()));
                }
            }
            rep.setReponsesQuestions(questionsRep);
        }

        return ResponseEntity.ok(reponses);
    }

    // ✅ 3. Supprimer une réponse
    @DeleteMapping("/mes-reponses/{id}")
    public ResponseEntity<?> supprimerReponse(@PathVariable Long id) {
        if (!reponseFormulaireRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reponseFormulaireRepository.deleteById(id);
        return ResponseEntity.ok("Réponse supprimée");
    }

    // ✅ 4. Modifier une réponse (commentaire + note globale)
    @Transactional
    @PutMapping("/mes-reponses/{id}")
    public ResponseEntity<?> modifierReponse(
            @PathVariable Long id,
            @RequestBody ReponseFormulaire nouvelleReponse) {
        return reponseFormulaireRepository.findById(id)
                .map(rep -> {
                    rep.setCommentaire(nouvelleReponse.getCommentaire());
                    rep.setNoteGlobal(nouvelleReponse.getNoteGlobal());

                    // Supprimer les anciennes réponses aux questions
                    reponseQuestionRepository.deleteByReponseFormulaireId(rep.getId());

                    // Réinsérer les nouvelles réponses
                    if (nouvelleReponse.getReponsesQuestions() != null) {
                        for (ReponseQuestion rq : nouvelleReponse.getReponsesQuestions()) {
                            rq.setReponseFormulaire(rep);
                            reponseQuestionRepository.save(rq);
                        }
                    }
                    return ResponseEntity.ok(reponseFormulaireRepository.save(rep));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 5. Détail d’une seule réponse par ID
    @GetMapping("/mes-reponses-detail-by-id/{id}")
    public ResponseEntity<?> getReponseDetailById(@PathVariable Long id) {
        return reponseFormulaireRepository.findById(id)
                .map(rep -> {
                    if (rep.getIdFormulaire() != null) {
                        formulaireRepository.findById(rep.getIdFormulaire())
                                .ifPresent(form -> rep.setTitreFormulaire(form.getTitre()));
                    }

                    List<ReponseQuestion> questionsRep = reponseQuestionRepository.findByReponseFormulaireId(rep.getId());
                    for (ReponseQuestion rq : questionsRep) {
                        if (rq.getIdQuestion() != null) {
                            questionRepository.findById(rq.getIdQuestion())
                                    .ifPresent(q -> rq.setQuestionLibelle(q.getLibelle()));
                        }
                    }
                    rep.setReponsesQuestions(questionsRep);

                    return ResponseEntity.ok(rep);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 6. Journal (admin)
    @GetMapping("/journal")
    public ResponseEntity<?> getJournal() {
        List<ReponseFormulaire> reponses = reponseFormulaireRepository.findAll();

        List<Map<String, Object>> journal = reponses.stream().map(rep -> {
            Map<String, Object> entry = new HashMap<>();

            formulaireRepository.findById(rep.getIdFormulaire())
                    .ifPresent(form -> entry.put("titreFormulaire", form.getTitre()));

            userRepository.findById(rep.getIdUtilisateur())
                    .ifPresent(user -> entry.put("nomEvaluateur", user.getNom()));

            entry.put("dateReponse", new java.util.Date());

            List<Map<String, String>> qrList = reponseQuestionRepository.findByReponseFormulaireId(rep.getId())
                    .stream()
                    .map(rq -> {
                        Map<String, String> qr = new HashMap<>();
                        Question question = questionRepository.findById(rq.getIdQuestion()).orElse(null);
                        if (question != null) {
                            qr.put("question", question.getLibelle());
                        } else {
                            qr.put("question", "Question inconnue");
                        }
                        qr.put("reponse", rq.getValeur() != null ? rq.getValeur() : "Non répondu");
                        return qr;
                    })
                    .toList();

            entry.put("questionsReponses", qrList);

            return entry;
        }).toList();

        return ResponseEntity.ok(journal);
    }

}
