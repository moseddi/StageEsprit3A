package com.example.SujetStage.controllers;

import com.example.SujetStage.dto.SecurityCaptureRequest;
import com.example.SujetStage.dto.UserResponseDto;
import com.example.SujetStage.entities.User;
import com.example.SujetStage.repositories.UserRepository;
import com.example.SujetStage.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.SujetStage.config.JwtService;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Autowired
    public UserController(PasswordEncoder passwordEncoder,
                          UserRepository userRepository,
                          EmailService emailService,
                          JwtService jwtService,
                          UserDetailsService userDetailsService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect");
        }

        User user = userOpt.get();

        // Vérification mot de passe (pas de verrouillage infini)
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe incorrect.");
        }

        // Générer le token JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", new UserResponseDto(user));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User newUser) {
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Cet email est déjà utilisé");
        }
        if (newUser.getAdresse() == null) newUser.setAdresse("");
        if (newUser.getIdentite() == null) newUser.setIdentite("");
        newUser.setPhoto(null);
        newUser.setRole("USER");
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        userRepository.save(newUser);
        return ResponseEntity.ok("Compte créé avec succès");
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponseDto> getUserByEmail(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.map(user -> ResponseEntity.ok(new UserResponseDto(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping(value = "/update-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDto> updateProfile(
            @RequestParam String email,
            @RequestParam String nom,
            @RequestParam String adresse,
            @RequestParam String identite,
            @RequestParam(value = "photo", required = false) MultipartFile photoFile
    ) throws IOException {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        User user = userOpt.get();
        user.setNom(nom);
        user.setAdresse(adresse);
        user.setIdentite(identite);

        if (photoFile != null && !photoFile.isEmpty()) {
            user.setPhoto(photoFile.getBytes());
        }

        userRepository.save(user);
        return ResponseEntity.ok(new UserResponseDto(user));
    }

    @GetMapping("/role")
    public ResponseEntity<Map<String, String>> getUserRole(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Utilisateur introuvable"));
        }
        return ResponseEntity.ok(Map.of("role", userOpt.get().getRole()));
    }

    @PostMapping("/security-capture")
    public ResponseEntity<String> securityCapture(@RequestBody SecurityCaptureRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
        }

        try {
            String base64Image = request.getImage();
            if (base64Image.contains(",")) {
                base64Image = base64Image.split(",")[1];
            }

            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            emailService.sendSecurityAlert(request.getEmail(), imageBytes);

            return ResponseEntity.ok("Email de sécurité envoyé avec la photo");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'envoi de l'email");
        }
    }
}
