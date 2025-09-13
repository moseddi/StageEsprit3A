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
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe ne peut pas être null ou vide pour la création d'un nouvel utilisateur.");
        }
        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setNom(userDetails.getNom());
        user.setEmail(userDetails.getEmail().trim().toLowerCase());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        user.setRole(userDetails.getRole());
        user.setBio(userDetails.getBio());
        user.setAvatar(userDetails.getAvatar());
        return userRepository.save(user);
    }

    public User updateCurrentUser(String email, User userDetails) {
        System.out.println("DEBUG: updateCurrentUser - Email: " + email); // Debug log
        String emailNormalized = email.trim().toLowerCase();
        System.out.println("DEBUG: updateCurrentUser - Normalized Email: " + emailNormalized); // Debug log
        User user = userRepository.findByEmailIgnoreCase(emailNormalized)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé pour l'email: " + emailNormalized));
        user.setNom(userDetails.getNom());
        user.setEmail(userDetails.getEmail().trim().toLowerCase());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        user.setRole(userDetails.getRole());
        user.setBio(userDetails.getBio());
        if (userDetails.getAvatar() != null && userDetails.getAvatar().length() > 2_000_000) {
            throw new RuntimeException("L'avatar est trop grand (limite: 2 Mo)");
        }
        user.setAvatar(userDetails.getAvatar());
        User savedUser = userRepository.save(user);
        System.out.println("DEBUG: updateCurrentUser - Saved User: " + savedUser.getEmail()); // Debug log
        return savedUser;
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    public User authenticate(String email, String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe ne peut pas être null ou vide pour l'authentification.");
        }
        String emailNormalized = email.trim().toLowerCase();
        System.out.println("DEBUG: authenticate - Email (normalized): " + emailNormalized);
        Optional<User> userOptional = userRepository.findByEmailIgnoreCase(emailNormalized);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
        }
        return null;
    }

    public boolean emailExists(String email) {
        String emailNormalized = email.trim().toLowerCase();
        return userRepository.findByEmailIgnoreCase(emailNormalized).isPresent();
    }

    public Map<String, String> forgotPassword(String email) {
        String emailNormalized = email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(emailNormalized)
                .orElseThrow(() -> new RuntimeException("Si cet email existe, les informations de mot de passe ont été envoyées"));
        Map<String, String> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("message", "Vérifiez votre email pour les informations de mot de passe");
        return response;
    }

    public Optional<User> findByEmailAndPassword(String email, String password) {
        String emailNormalized = email.trim().toLowerCase();
        return userRepository.findByEmailAndPassword(emailNormalized, password);
    }

    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }
}
