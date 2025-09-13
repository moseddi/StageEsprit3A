package org.example.sujetstage3a.service;

import org.example.sujetstage3a.dto.AnswerDTO;
import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.model.ReponseFormulaire;
import org.example.sujetstage3a.model.ReponseQuestion;
import org.example.sujetstage3a.repository.LienEvaluationRepository;
import org.example.sujetstage3a.repository.ReponseFormulaireRepository;
import org.example.sujetstage3a.repository.ReponseQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;


@Service
public class EvaluationService {

    @Autowired
    private ReponseFormulaireRepository reponseFormulaireRepository;

    @Autowired
    private ReponseQuestionRepository reponseQuestionRepository;

    @Autowired
    private LienEvaluationRepository lienEvaluationRepository;

    public void submitEvaluation(Integer formId, List<AnswerDTO> answers, String token, Integer userId) {
        List<LienEvaluation> liens = lienEvaluationRepository.findAllByToken(token);

        if (liens.isEmpty()) {
            throw new RuntimeException("Lien invalide ou expiré");
        }

        LienEvaluation lien = liens.stream()
                .filter(l -> l.getExpiration() == null || l.getExpiration().after(new Date()))
                .sorted(Comparator.comparing(LienEvaluation::getExpiration, Comparator.nullsLast(Comparator.reverseOrder())))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun lien valide trouvé"));

        // 🟢 تحديد المستخدم الصحيح
        Integer evaluateurId = (lien.getIdEvaluateur() != null) ? lien.getIdEvaluateur() : userId;

        System.out.println("🟢 submitEvaluation: userId=" + evaluateurId + ", formId=" + formId + ", token=" + token);

        // 🔥 نخزّن الفورمulaire réponse للمستعمل الحالي فقط
        ReponseFormulaire reponseFormulaire = new ReponseFormulaire();
        reponseFormulaire.setIdFormulaire(formId);
        reponseFormulaire.setIdUtilisateur(evaluateurId); // ✅ نربطها بالـ user الصحيح
        reponseFormulaire.setCommentaire("");
        reponseFormulaire.setNoteGlobal(null);

        reponseFormulaire = reponseFormulaireRepository.save(reponseFormulaire);

        System.out.println("✅ RéponseFormulaire enregistré: id=" + reponseFormulaire.getId() +
                " | userId=" + evaluateurId +
                " | formId=" + formId);

        // ✅ نزيد نحط الأجوبة
        for (AnswerDTO answer : answers) {
            ReponseQuestion reponseQuestion = new ReponseQuestion();
            reponseQuestion.setIdQuestion(answer.getQuestionId());
            reponseQuestion.setValeur(answer.getTexte());
            reponseQuestion.setReponseFormulaire(reponseFormulaire);
            reponseQuestionRepository.save(reponseQuestion);
        }

        System.out.println("📌 Total réponses sauvegardées: " + answers.size());
    }


    // ✅ Ici on ferme bien submitEvaluation

    public List<ReponseFormulaire> getEVALUATEURResponses(Integer userId) {
        return reponseFormulaireRepository.findByIdUtilisateur(userId).stream()
                .map(rf -> {
                    rf.setReponsesQuestions(reponseQuestionRepository.findByReponseFormulaireId(rf.getId()));
                    return rf;
                })
                .collect(Collectors.toList());
    }

    public ReponseFormulaire updateResponse(Long responseId, ReponseFormulaire updatedResponse, List<AnswerDTO> answers) {
        ReponseFormulaire existingResponse = reponseFormulaireRepository.findById(responseId)
                .orElseThrow(() -> new RuntimeException("Réponse non trouvée"));

        existingResponse.setCommentaire(updatedResponse.getCommentaire());
        existingResponse.setNoteGlobal(updatedResponse.getNoteGlobal());

        // ⚠️ Supprimer les anciennes réponses
        reponseQuestionRepository.deleteByReponseFormulaireId(existingResponse.getId());

        // Sauvegarder les nouvelles réponses
        for (AnswerDTO answer : answers) {
            ReponseQuestion reponseQuestion = new ReponseQuestion();
            reponseQuestion.setIdQuestion(answer.getQuestionId());
            reponseQuestion.setValeur(answer.getTexte());
            reponseQuestion.setReponseFormulaire(existingResponse);
            reponseQuestionRepository.save(reponseQuestion);
        }

        return reponseFormulaireRepository.save(existingResponse);
    }

    public void deleteResponse(Long responseId) {
        if (!reponseFormulaireRepository.existsById(responseId)) {
            throw new RuntimeException("Réponse non trouvée");
        }
        reponseFormulaireRepository.deleteById(responseId);
    }

 /*   public Map<String, Integer> getStats(Integer userId) {
        // 🔹 Récupérer tous les liens envoyés à cet utilisateur
        List<LienEvaluation> liens = lienEvaluationRepository.findAllByIdEvaluateur(userId)
                .stream()
                .filter(lien -> lien.getExpiration() == null || lien.getExpiration().after(new Date()))
                .collect(Collectors.toList());

        // 🔹 Identifier les formulaires uniques envoyés
        Set<Integer> formIds = liens.stream()
                .map(LienEvaluation::getIdFormulaire)
                .collect(Collectors.toSet());

        long total = formIds.size();

        // 🔹 Compter les formulaires remplis par l’utilisateur
        long filled = 0;
        if (!formIds.isEmpty()) {
            filled = reponseFormulaireRepository.countFilledForms(userId, new ArrayList<>(formIds));
        }

        long unfilled = total - filled;

        System.out.println("📊 Stats Debug -> total=" + total + " | filled=" + filled + " | unfilled=" + unfilled);

        return Map.of(
                "formulairesRemplis", (int) filled,
                "formulairesNonRemplis", (int) unfilled,
                "totalFormulaires", (int) total
        );
    }*/
 public Map<String, Integer> getStats(Integer userId) {
     // 🔹 Récupérer tous les liens envoyés à cet utilisateur
     List<LienEvaluation> liens = lienEvaluationRepository.findAllByIdEvaluateur(userId)
             .stream()
             .filter(lien -> lien.getExpiration() == null || lien.getExpiration().after(new Date()))
             .collect(Collectors.toList());

     // 🔹 Identifier les formulaires uniques envoyés
     Set<Integer> formIds = liens.stream()
             .map(LienEvaluation::getIdFormulaire)
             .collect(Collectors.toSet());

     long totalFormulaires = formIds.size();

     // 🔹 Compter formulaires remplis
     long formulairesRemplis = 0;
     if (!formIds.isEmpty()) {
         formulairesRemplis = reponseFormulaireRepository.countFilledForms(userId, new ArrayList<>(formIds));
     }
     long formulairesNonRemplis = totalFormulaires - formulairesRemplis;

     // 🔹 Compter questions répondues et non répondues
     List<ReponseFormulaire> reponses = reponseFormulaireRepository.findByIdUtilisateur(userId);

     long questionsRepondues = 0;
     long questionsTotales = 0;

     for (ReponseFormulaire rf : reponses) {
         List<ReponseQuestion> questions = rf.getReponsesQuestions();
         if (questions != null) {
             questionsTotales += questions.size();
             questionsRepondues += questions.stream()
                     .filter(q -> q.getValeur() != null && !q.getValeur().trim().isEmpty())
                     .count();
         }
     }

     long questionsNonRepondues = questionsTotales - questionsRepondues;

     System.out.println("📊 Stats Debug -> totalFormulaires=" + totalFormulaires +
             " | remplis=" + formulairesRemplis +
             " | nonRemplis=" + formulairesNonRemplis +
             " | questionsTotales=" + questionsTotales +
             " | répondues=" + questionsRepondues +
             " | nonRépondues=" + questionsNonRepondues);

     return Map.of(
             "formulairesRemplis", (int) formulairesRemplis,
             "formulairesNonRemplis", (int) formulairesNonRemplis,
             "totalFormulaires", (int) totalFormulaires,
             "questionsRepondues", (int) questionsRepondues,
             "questionsNonRepondues", (int) questionsNonRepondues,
             "totalQuestions", (int) questionsTotales
     );
 }


}