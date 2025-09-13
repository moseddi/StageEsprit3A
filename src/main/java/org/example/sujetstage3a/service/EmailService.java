package org.example.sujetstage3a.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendEvaluationLink(String recipientEmail, String evaluationLink, String formTitle) throws MessagingException {
        try {
            logger.info("Preparing to send email to {} with link {} and title {}", recipientEmail, evaluationLink, formTitle);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(recipientEmail);
            helper.setSubject("Lien d'évaluation : " + formTitle);
            helper.setText(
                    "<h3>Bonjour,</h3>" +
                            "<p>Vous êtes invité à compléter le formulaire <b>" + formTitle + "</b>.</p>" +
                            "<p>Cliquez ici :</p>" +
                            "<a href=\"" + evaluationLink + "\">Accéder au formulaire</a>" +
                            "<p>Cordialement,</p>",
                    true
            );

            mailSender.send(message);
            logger.info("Email sent successfully to {}", recipientEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send email to {}: {}", recipientEmail, e.getMessage(), e);
            throw new MessagingException("Failed to send email: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while sending email to {}: {}", recipientEmail, e.getMessage(), e);
            throw new MessagingException("Unexpected error while sending email: " + e.getMessage(), e);
        }
    }
}