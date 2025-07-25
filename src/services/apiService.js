// src/services/apiService.js
const API_URL = 'http://localhost:8081/api'; // Vérifiez que cette URL correspond bien à votre backend

const apiFetch = async (url, options = {}) => {
    // Si options.authToken est fourni, il devrait être au format "email:password" non encodé en base64.
    // Cette fonction l'encodera en base64 et l'ajoutera à l'en-tête Authorization.
    const authTokenHeader = options.authToken ? `Basic ${btoa(options.authToken)}` : '';

    try {
        const response = await fetch(url, {
            ...options, // Permet de passer d'autres options fetch (method, cache, etc.)
            headers: {
                'Content-Type': 'application/json',
                ...(authTokenHeader && { 'Authorization': authTokenHeader }), // Ajoute l'en-tête si authToken est présent
                ...options.headers, // Permet de fusionner avec des en-têtes personnalisés
            },
            body: options.body ? JSON.stringify(options.body) : null, // Convertit le corps en JSON si présent
        });

        if (!response.ok) {
            // Tente de lire le message d'erreur du backend pour un meilleur diagnostic
            let errorDetail = 'Aucune information d\'erreur.';
            try {
                const errorJson = await response.json();
                if (errorJson.message) {
                    errorDetail = errorJson.message;
                } else if (errorJson.error) {
                    errorDetail = errorJson.error;
                } else {
                    errorDetail = JSON.stringify(errorJson);
                }
            } catch (jsonError) {
                // Si la réponse n'est pas un JSON, tente de lire le texte brut
                errorDetail = await response.text().catch(() => 'Réponse d\'erreur illisible.');
            }
            const errorMessage = `Erreur ${response.status}: ${errorDetail}`;
            const error = new Error(errorMessage);
            error.response = response; // Attache la réponse complète à l'erreur pour un débogage avancé
            throw error;
        }

        // Gère les réponses sans contenu (ex: 204 No Content)
        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur apiFetch:", error);
        throw error; // Re-jette l'erreur pour qu'elle soit gérée par l'appelant
    }
};

// Fonctions Utilisateurs
export const fetchUtilisateurs = (authToken) => apiFetch(`${API_URL}/users`, { authToken });
export const createUser = (userData, authToken) => apiFetch(`${API_URL}/users`, { method: 'POST', body: userData, authToken });
export const updateUser = (id, userData, authToken) => apiFetch(`${API_URL}/users/${id}`, { method: 'PUT', body: userData, authToken });
export const deleteUser = (id, authToken) => apiFetch(`${API_URL}/users/${id}`, { method: 'DELETE', authToken });

// Correction ici : `credentials` doit contenir `email` et `motDePasse`
export const loginUser = (credentials) => apiFetch(`${API_URL}/users/login`, { method: 'POST', body: credentials });

export const requestForgotPassword = (email) => apiFetch(`${API_URL}/users/forgot-password`, { method: 'POST', body: { email } });
export const resetPassword = (data) => apiFetch(`${API_URL}/users/reinitialiser-mot-de-passe`, { method: 'POST', body: data });
export const updateCurrentUser = (userData, authToken) => apiFetch(`${API_URL}/users/me`, { method: 'PUT', body: userData, authToken });

// NOUVELLE FONCTION : Vérifie si un email existe déjà dans le système
export const checkEmailExists = async (email) => {
    try {
        // L'endpoint backend que nous avons défini retourne directement true ou false
        const exists = await apiFetch(`${API_URL}/users/exists-by-email?email=${encodeURIComponent(email)}`);
        return exists; // Retourne true ou false
    } catch (error) {
        // Si la vérification échoue (ex: erreur réseau), renvoie l'erreur
        throw error;
    }
};


// Fonctions Classes
export const fetchClasses = (authToken) => apiFetch(`${API_URL}/classes`, { authToken });
export const createClass = (classData, authToken) => apiFetch(`${API_URL}/classes`, { method: 'POST', body: classData, authToken });
export const updateClass = (id, classData, authToken) => apiFetch(`${API_URL}/classes/${id}`, { method: 'PUT', body: classData, authToken });
export const deleteClass = (id, authToken) => apiFetch(`${API_URL}/classes/${id}`, { method: 'DELETE', authToken });

// Fonctions Étudiants
export const fetchEtudiants = (authToken) => apiFetch(`${API_URL}/etudiants`, { authToken });
export const createEtudiant = (etudiantData, authToken) => apiFetch(`${API_URL}/etudiants`, { method: 'POST', body: etudiantData, authToken });
export const updateEtudiant = (id, etudiantData, authToken) => apiFetch(`${API_URL}/etudiants/${id}`, { method: 'PUT', body: etudiantData, authToken });
export const deleteEtudiant = (id, authToken) => apiFetch(`${API_URL}/etudiants/${id}`, { method: 'DELETE', authToken });

// Fonctions Formulaires
export const fetchFormulaires = (page = 0, size = 10, authToken) => apiFetch(`${API_URL}/formulaires?page=${page}&size=${size}`, { authToken });
export const createFormulaire = (formData, authToken) => apiFetch(`${API_URL}/formulaires`, { method: 'POST', body: formData, authToken });
export const updateFormulaire = (id, formData, authToken) => apiFetch(`${API_URL}/formulaires/${id}`, { method: 'PUT', body: formData, authToken });
export const deleteFormulaire = (id, authToken) => apiFetch(`${API_URL}/formulaires/${id}`, { method: 'DELETE', authToken });
export const fetchEvaluatorFormulaires = (evaluatorId, authToken) => apiFetch(`${API_URL}/formulaires/evaluator/${evaluatorId}`, { authToken });

// Fonctions Questions
export const fetchQuestions = (formulaireId, authToken) => apiFetch(`${API_URL}/questions?id_formulaire=${formulaireId}`, { authToken });
export const createQuestion = (formulaireId, questionData, authToken) => apiFetch(`${API_URL}/questions?id_formulaire=${formulaireId}`, { method: 'POST', body: questionData, authToken });
export const updateQuestion = (id, questionData, authToken) => apiFetch(`${API_URL}/questions/${id}`, { method: 'PUT', body: questionData, authToken });
export const deleteQuestion = (id, authToken) => apiFetch(`${API_URL}/questions/${id}`, { method: 'DELETE', authToken });

// Fonctions Liens d'évaluation
export const generateEvaluationLink = (formulaireId, authToken) => apiFetch(`${API_URL}/lien-evaluation`, { method: 'POST', body: { id_formulaire: formulaireId, expiration: null }, authToken });

// Soumission d'évaluation (si cette route existe sur votre backend)
export const submitEvaluation = (formulaireId, answers, authToken) => apiFetch('/api/evaluation/submit', { method: 'POST', body: { formulaireId, answers }, authToken });