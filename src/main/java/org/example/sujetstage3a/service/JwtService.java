package org.example.sujetstage3a.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private Key key;
    @Autowired
    private JavaMailSender mailSender;
    @PostConstruct
    public void init() {
        String secret = "cle_super_secrete_de_256_bits_minimum_aaaaaaaaaaaaaaaaaaaaaaaaaaaa"; // au moins 256 bits pour HS256
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String createTokenWithExpiration(Long formId, LocalDateTime expiration) {
        Date expDate = Date.from(expiration.atZone(ZoneId.systemDefault()).toInstant());

        return Jwts.builder()
                .setSubject(formId.toString())
                .setExpiration(expDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    public void sendEvaluationLinkByEmail(String email, String token) {
        String link = "http://localhost:3000/evaluation?token=" + token; // ou ton URL React
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Lien d’évaluation");
        message.setText("Veuillez remplir le formulaire via ce lien : " + link);
        mailSender.send(message);
    }
}
