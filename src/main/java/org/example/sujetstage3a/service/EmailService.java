package org.example.sujetstage3a.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEvaluationLink(String recipientEmail, String token, String formulaireTitre) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        String link = "http://localhost:3000/evaluation?token=" + token; // Adjust URL based on your frontend
        String subject = "Lien d'évaluation pour le formulaire: " + formulaireTitre;
        String htmlContent = "<h3>Bonjour,</h3>" +
                "<p>Vous êtes invité à compléter le formulaire d'évaluation suivant : <strong>" + formulaireTitre + "</strong>.</p>" +
                "<p>Cliquez sur le lien ci-dessous pour accéder au formulaire :</p>" +
                "<a href='" + link + "' style='color: #ff69b4; text-decoration: none;'>Accéder au Formulaire</a>" +
                "<p>Ce lien est valable jusqu'à son expiration. Merci de répondre dans les délais.</p>" +
                "<p>Cordialement,<br>L'équipe pédagogique</p>";

        helper.setTo(recipientEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
    }
}