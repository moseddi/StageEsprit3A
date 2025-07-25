package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.User;
import org.example.sujetstage3a.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) { // Ajout de trim()
            throw new IllegalArgumentException("Le mot de passe ne peut pas être null ou vide pour la création d'un nouvel utilisateur.");
        }
        // CORRECTION : Normaliser l'email en minuscules et sans espaces avant de sauvegarder
        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setNom(userDetails.getNom());

        // CORRECTION : Normaliser l'email entrant et vérifier l'unicité
        String newEmailNormalized = userDetails.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmailNormalized)) { // Si l'email a changé
            if (emailExists(newEmailNormalized)) { // Utilise la méthode emailExists (insensible à la casse)
                throw new RuntimeException("Cet email est déjà utilisé par un autre utilisateur.");
            }
            user.setEmail(newEmailNormalized); // Stocker le nouvel email normalisé
        }

        user.setRole(userDetails.getRole());
        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) { // Ajout de trim()
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        return userRepository.save(user);
    }

    public User updateCurrentUser(String email, User userDetails) {
        // CORRECTION : Normaliser l'email extrait du token avant la recherche
        String emailFromTokenNormalized = email.trim().toLowerCase();
        System.out.println("DEBUG: updateCurrentUser - Email from token (normalized): " + emailFromTokenNormalized); // DEBUG

        User user = userRepository.findByEmailIgnoreCase(emailFromTokenNormalized) // Utilise l'email normalisé
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setNom(userDetails.getNom());

        // CORRECTION : Normaliser l'email entrant et vérifier l'unicité
        String newEmailNormalized = userDetails.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(newEmailNormalized)) { // Si l'email a changé
            if (emailExists(newEmailNormalized)) { // Utilise la méthode emailExists (insensible à la casse)
                throw new RuntimeException("Cet email est déjà utilisé par un autre compte.");
            }
            user.setEmail(newEmailNormalized); // Stocker le nouvel email normalisé
        }

        // Le rôle NE DOIT PAS être mis à jour par l'utilisateur lui-même pour des raisons de sécurité.
        // Laissez cette ligne commentée ou supprimez-la si l'utilisateur ne doit pas changer son rôle.
        // user.setRole(userDetails.getRole());

        if (userDetails.getPassword() != null && !userDetails.getPassword().trim().isEmpty()) { // Ajout de trim()
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    public User authenticate(String email, String password) {
        if (password == null || password.trim().isEmpty()) { // Utilisation de trim() pour gérer les espaces
            throw new IllegalArgumentException("Le mot de passe ne peut pas être null ou vide pour l'authentification.");
        }

        // CORRECTION : Normaliser l'email entrant avant la recherche
        String emailNormalized = email.trim().toLowerCase();
        System.out.println("DEBUG: authenticate - Email (normalized): " + emailNormalized); // DEBUG

        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(emailNormalized); // Utilise l'email normalisé
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        return null;
    }

    public boolean emailExists(String email) {
        // CORRECTION : Normaliser l'email avant la recherche
        String emailNormalized = email.trim().toLowerCase();
        return userRepository.findByEmailIgnoreCase(emailNormalized).isPresent();
    }

    public Map<String, String> forgotPassword(String email) {
        // CORRECTION : Normaliser l'email avant la recherche
        String emailNormalized = email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(emailNormalized)
                .orElseThrow(() -> new RuntimeException("Si cet email existe, les informations de mot de passe ont été envoyées"));

        Map<String, String> response = new HashMap<>();
        response.put("email", user.getEmail()); // Renvoie l'email tel qu'il est en BD (normalisé)
        response.put("message", "Vérifiez votre email pour les informations de mot de passe");
        return response;
    }

    public Optional<User> findByEmailAndPassword(String email, String password) {
        // CORRECTION : Normaliser l'email avant la recherche
        String emailNormalized = email.trim().toLowerCase();
        // Note: findByEmailAndPassword ne sera pas insensible à la casse sur le mot de passe,
        // mais l'email sera normalisé.
        return userRepository.findByEmailAndPassword(emailNormalized, password);
    }
    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }
}