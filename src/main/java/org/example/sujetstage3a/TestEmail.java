package org.example.sujetstage3a;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.Properties;

public class TestEmail {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.debug", "true");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("bejaoui.amal@esprit.tn", "sjax ypkh xxgw vet");
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("bejaoui.amal@esprit.tn"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse("your-real-email@example.com"));
            message.setSubject("Test Email");
            message.setText("This is a test email sent from Jakarta Mail.");
            Transport.send(message);
            System.out.println("Email sent successfully!");
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}