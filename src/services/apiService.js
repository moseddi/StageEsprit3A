const API_URL = 'http://localhost:8081/api';

const apiFetch = async (url, options = {}) => {
    const authTokenHeader = options.authToken || '';
    try {
        if (authTokenHeader && !authTokenHeader.startsWith('Basic ')) {
            console.error('DEBUG: apiFetch - Invalid authToken:', authTokenHeader);
            throw new Error('En-tête Authorization invalide : préfixe Basic manquant');
        }
        console.log('DEBUG: apiFetch - URL:', url, 'authToken:', authTokenHeader);
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(authTokenHeader && { 'Authorization': authTokenHeader }),
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : null,
        });
        if (!response.ok) {
            let errorDetail = 'Aucune information d\'erreur.';
            try {
                const contentType = response.headers.get('Content-Type') || '';
                if (contentType.includes('application/json')) {
                    const errorJson = await response.json();
                    if (errorJson.message) {
                        errorDetail = errorJson.message;
                    } else if (errorJson.error) {
                        errorDetail = errorJson.error;
                    } else {
                        errorDetail = JSON.stringify(errorJson);
                    }
                } else {
                    errorDetail = await response.text() || 'Réponse d\'erreur illisible.';
                }
            } catch (jsonError) {
                console.error('DEBUG: apiFetch - Error parsing response:', jsonError);
                errorDetail = await response.text().catch(() => 'Réponse d\'erreur illisible.');
            }
            const errorMessage = `Erreur ${response.status}: ${errorDetail}`;
            const error = new Error(errorMessage);
            error.response = response;
            throw error;
        }
        if (response.status === 204 || response.headers.get('Content-Length') === '0') {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur apiFetch:", error);
        throw error;
    }
};

// Fonctions Utilisateurs
export const fetchUtilisateurs = (authToken) => apiFetch(`${API_URL}/users`, { authToken });
export const createUser = (userData, authToken) => apiFetch(`${API_URL}/users`, { method: 'POST', body: userData, authToken });
export const updateUser = (id, userData, authToken) => apiFetch(`${API_URL}/users/${id}`, { method: 'PUT', body: userData, authToken });
export const deleteUser = (id, authToken) => apiFetch(`${API_URL}/users/${id}`, { method: 'DELETE', authToken });
export const loginUser = (credentials) => apiFetch(`${API_URL}/users/login`, { method: 'POST', body: credentials });
export const requestForgotPassword = (email) => apiFetch(`${API_URL}/users/forgot-password`, { method: 'POST', body: { email } });
export const resetPassword = (data) => apiFetch(`${API_URL}/users/reinitialiser-mot-de-passe`, { method: 'POST', body: data });
export const updateCurrentUser = (userData, authToken) => apiFetch(`${API_URL}/users/me`, { method: 'PUT', body: userData, authToken });
export const checkEmailExists = async (email) => {
    try {
        const exists = await apiFetch(`${API_URL}/users/exists-by-email?email=${encodeURIComponent(email)}`);
        return exists;
    } catch (error) {
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
export const fetchEVALUATEURFormulaires = (EVALUATEURId, authToken) =>
    apiFetch(`${API_URL}/formulaires/evaluator/${EVALUATEURId}`, { authToken });

// Fonctions Questions
export const fetchQuestions = (formulaireId, authToken) => apiFetch(`${API_URL}/questions?id_formulaire=${formulaireId}`, { authToken });
export const createQuestion = (formulaireId, questionData, authToken) => apiFetch(`${API_URL}/questions?id_formulaire=${formulaireId}`, { method: 'POST', body: questionData, authToken });
export const updateQuestion = (id, questionData, authToken) => apiFetch(`${API_URL}/questions/${id}`, { method: 'PUT', body: questionData, authToken });
export const deleteQuestion = (id, authToken) => apiFetch(`${API_URL}/questions/${id}`, { method: 'DELETE', authToken });

// Fonctions Liens d'évaluation
export const generateEvaluationLink = (formulaireId, authToken) => apiFetch(`${API_URL}/lien-evaluation`, { method: 'POST', body: { id_formulaire: formulaireId, expiration: null }, authToken });
export const getFormulaireByToken = async (token) => {
    const response = await fetch(`/api/evaluation/formulaire?token=${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération du formulaire');
    }
    return response.json();
};

export const submitEvaluation = async (formId, answers, token, userId) => {
    const response = await fetch(`/api/evaluation/submit?formId=${formId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Evaluation-Token': token,
            'X-User-Id': userId
        },
        body: JSON.stringify(answers),
    });
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error('Erreur soumission : ' + errorData);
    }
    return response.json();
};

export const fetchEvaluationLink = async (userId) => {
    const response = await fetch(`${API_URL}/evaluation/user-link`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId
        }
    });
    if (!response.ok) {
        throw new Error('Erreur récupération lien');
    }
    return await response.text();
};
