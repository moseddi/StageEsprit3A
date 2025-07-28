package com.example.SujetStage.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendSecurityAlert(String toEmail, byte[] imageBytes) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();

        // true = message multipart (texte + pièce jointe)
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("Alerte de sécurité : tentatives de connexion suspectes");
        helper.setText(
                "Bonjour,\n\n" +
                        "Nous avons détecté plusieurs tentatives de connexion infructueuses sur votre compte. " +
                        "Une photo a été prise automatiquement pour vérifier votre identité.\n\n" +
                        "Si ce n'était pas vous, merci de prendre les mesures nécessaires.\n\n" +
                        "Cordialement,\nVotre équipe de sécurité"
        );

        if (imageBytes != null) {
            helper.addAttachment("capture.png", new ByteArrayResource(imageBytes));
        }

        mailSender.send(message);
    }
}
