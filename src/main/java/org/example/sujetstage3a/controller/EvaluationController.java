package org.example.sujetstage3a.controller;
import org.example.sujetstage3a.dto.FormulaireDTO;
import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.dto.AnswerDTO;
import org.example.sujetstage3a.model.ReponseFormulaire;
import org.example.sujetstage3a.model.User;
import org.example.sujetstage3a.repository.ReponseFormulaireRepository;
import org.example.sujetstage3a.repository.UserRepository;
import org.example.sujetstage3a.service.EvaluationLinkService;
import org.example.sujetstage3a.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

/*@RestController
@RequestMapping("/api/evaluation")
public class EvaluationController {

    private static final Logger logger = LoggerFactory.getLogger(EvaluationController.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private EvaluationLinkService evaluationLinkService;

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping("/send-link")
    public ResponseEntity<?> sendEvaluationLink(
            @RequestParam Long formId,
            @RequestParam String recipientEmail,
            @RequestHeader("Authorization") String authToken
    ) {
        try {
            logger.info("Processing send-link request for formId: {}, recipientEmail: {}", formId, recipientEmail);
            String token = evaluationLinkService.generateEvaluationLink(formId, authToken, null).getToken();
            String evaluationLink = "http://localhost:3000/evaluation?token=" + token;
            String formTitle = evaluationLinkService.getFormTitle(formId);
            emailService.sendEvaluationLink(recipientEmail, evaluationLink, formTitle);
            logger.info("Link sent successfully to {}", recipientEmail);
            return ResponseEntity.ok("Lien envoyé à " + recipientEmail);
        } catch (MessagingException e) {
            logger.error("Email sending failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Erreur envoi email : " + e.getMessage());
        } catch (Exception e) {
            logger.error("Link generation failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Erreur génération lien : " + e.getMessage());
        }
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String recipientEmail) {
        try {
            logger.info("Sending test email to {}", recipientEmail);
            emailService.sendEvaluationLink(recipientEmail, "http://localhost:3000/test", "Test Email");
            logger.info("Test email sent successfully to {}", recipientEmail);
            return ResponseEntity.ok("Test email envoyé à " + recipientEmail);
        } catch (MessagingException e) {
            logger.error("Test email failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Erreur envoi test email : " + e.getMessage());
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitEvaluation(
            @RequestParam Long formId,
            @RequestBody List<AnswerDTO> answers,
            @RequestHeader("X-Evaluation-Token") String token
    ) {
        try {
            logger.info("Processing submit evaluation for formId: {}", formId);
            evaluationService.submitEvaluation(formId, answers, token);
            return ResponseEntity.ok("Évaluation soumise avec succès");
        } catch (Exception e) {
            logger.error("Evaluation submission failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Erreur soumission : " + e.getMessage());
        }
    }

    @GetMapping("/formulaire")
    public ResponseEntity<?> getFormulaireByToken(@RequestParam String token) {
        try {
            logger.info("Fetching form by token: {}", token);
            LienEvaluation lien = evaluationLinkService.getLinkByToken(token)
                    .orElseThrow(() -> new RuntimeException("Lien invalide ou expiré"));
            if (lien.getExpiration() != null && lien.getExpiration().before(new java.util.Date())) {
                throw new RuntimeException("Lien expiré");
            }
            Formulaire formulaire = evaluationLinkService.getFormulaireById(lien.getIdFormulaire());
            return ResponseEntity.ok(new FormulaireDTO(formulaire.getId(), formulaire.getTitre(), formulaire.getDescription()));
        } catch (Exception e) {
            logger.error("Failed to fetch form: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}*/
@RestController
@RequestMapping("/api/evaluation")
public class EvaluationController {
    @Autowired
    private EvaluationLinkService evaluationLinkService;
    private static final Logger logger = LoggerFactory.getLogger(EvaluationController.class);
    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReponseFormulaireRepository reponseFormulaireRepository;
    @GetMapping("/EVALUATEURs")
    public ResponseEntity<List<User>> getEVALUATEURs() {
        try {
            List<String> roles = List.of("EVALUATEUR");
            List<User> EVALUATEURs = userRepository.findByRoleIgnoreCaseIn(roles);
            System.out.println("Évaluateurs trouvés : " + EVALUATEURs.size());
            return ResponseEntity.ok(EVALUATEURs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
    @PostMapping("/send-link")
    public ResponseEntity<?> assignEvaluationLink(
            @RequestParam Integer formId,
            @RequestParam Integer EVALUATEURId,
            @RequestHeader("Authorization") String authToken
    ) {
        try {
            String token = evaluationLinkService.generateEvaluationLink(formId, EVALUATEURId).getToken();
            String evaluationLink = "http://localhost:3000/evaluation?token=" + token;
            return ResponseEntity.ok("Lien assigné à l'évaluateur avec ID " + EVALUATEURId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur assignation lien : " + e.getMessage());
        }
    }

    @GetMapping("/user-link")
    public ResponseEntity<?> getUserEvaluationLink(@RequestHeader("X-User-Id") Integer userId) {
        System.out.println("Fetching link for userId: " + userId);
        try {
            LienEvaluation lien = evaluationLinkService.getLinkByEVALUATEURId(userId)
                    .orElseThrow(() -> new RuntimeException("Aucun lien d'évaluation assigné"));
            if (lien.getExpiration() != null && lien.getExpiration().before(new java.util.Date())) {
                throw new RuntimeException("Lien expiré");
            }
            String evaluationLink = "http://localhost:3000/evaluation?token=" + lien.getToken();
            System.out.println("Returning link: " + evaluationLink);
            return ResponseEntity.ok(evaluationLink);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Erreur récupération lien : " + e.getMessage());
        }
    }

    @GetMapping("/formulaire")
    public ResponseEntity<?> getFormulaireByToken(@RequestParam String token) {
        try {
            LienEvaluation lien = evaluationLinkService.getLinkByToken(token)
                    .orElseThrow(() -> new RuntimeException("Lien invalide ou expiré"));
            if (lien.getExpiration() != null && lien.getExpiration().before(new java.util.Date())) {
                throw new RuntimeException("Lien expiré");
            }
            Formulaire formulaire = evaluationLinkService.getFormulaireById(lien.getIdFormulaire());
            return ResponseEntity.ok(new FormulaireDTO(formulaire.getId(), formulaire.getTitre(), formulaire.getDescription()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitEvaluation(
            @RequestHeader("X-Evaluation-Token") String token,
            @RequestHeader("X-User-Id") Integer userId,
            @RequestParam("formId") Integer formId,
            @RequestBody List<AnswerDTO> answers) {
        try {
            evaluationService.submitEvaluation(formId, answers, token, userId);
            return ResponseEntity.ok("Évaluation soumise avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur soumission : " + e.getMessage());
        }
    }
    @GetMapping("/reponses")
    public List<ReponseFormulaire> getReponsesByEvaluateur(@RequestParam("userId") Integer userId) {
        return reponseFormulaireRepository.findByIdUtilisateur(userId);
    }
    @DeleteMapping("/reponse-formulaire/{id}")
    public ResponseEntity<?> deleteReponse(@PathVariable Long id) {
        reponseFormulaireRepository.deleteById(id);
        return ResponseEntity.ok("Réponse supprimée");
    }
    @GetMapping("/reponses-completes")
    public List<ReponseFormulaire> getReponsesAvecQuestions(@RequestParam("userId") Integer userId) {
        return reponseFormulaireRepository.findByIdUtilisateur(userId);
    }
    @GetMapping("/responses/{userId}")
    public ResponseEntity<List<ReponseFormulaire>> getEVALUATEURResponses(@PathVariable Integer userId) {
        return ResponseEntity.ok(evaluationService.getEVALUATEURResponses(userId));
    }

    @PutMapping("/response/{responseId}")
    public ResponseEntity<ReponseFormulaire> updateResponse(@PathVariable Long responseId, @RequestBody ReponseFormulaire updatedResponse, @RequestBody List<AnswerDTO> answers) {
        return ResponseEntity.ok(evaluationService.updateResponse(responseId, updatedResponse, answers));
    }

    @DeleteMapping("/response/{responseId}")
    public ResponseEntity<Void> deleteResponse(@PathVariable Long responseId) {
        evaluationService.deleteResponse(responseId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Integer>> getStats(@PathVariable Integer userId) {
        try {
            System.out.println("Fetching stats for userId: " + userId);
            Map<String, Integer> stats = evaluationService.getStats(userId);
            System.out.println("Stats: " + stats);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error fetching stats: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
 }