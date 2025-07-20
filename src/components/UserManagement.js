import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Table, Modal, Form, Input, Select, message, Card, Tag, Row, Col, Tabs, Typography, Alert, Space, Popconfirm, Button,
    InputNumber, DatePicker, Switch,
} from 'antd';
import {
    LockOutlined, MailOutlined, UserOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, UserSwitchOutlined,
    BookOutlined, LogoutOutlined, TeamOutlined, LinkOutlined, QuestionOutlined, CopyOutlined,
} from '@ant-design/icons';
import '../App.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const API_URL = 'http://localhost:8081/api';
const UTILISATEURS_API = `${API_URL}/users`;
const CLASSES_API = `${API_URL}/classes`;
const ETUDIANTS_API = `${API_URL}/etudiants`;
const FORMULAIRES_API = `${API_URL}/formulaires`;
const QUESTIONS_API = `${API_URL}/questions`;
const LIEN_EVALUATION_API = `${API_URL}/lien-evaluation`;

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

const UserManagement = ({ setUserName, onLogout }) => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [classes, setClasses] = useState([]);
    const [etudiants, setEtudiants] = useState([]);
    const [formulaires, setFormulaires] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [classModalVisible, setClassModalVisible] = useState(false);
    const [etudiantModalVisible, setEtudiantModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [formulaireModalVisible, setFormulaireModalVisible] = useState(false);
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [linkModalVisible, setLinkModalVisible] = useState(false);
    const [submissionModalVisible, setSubmissionModalVisible] = useState(false); // New for evaluator form submission
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedEtudiant, setSelectedEtudiant] = useState(null);
    const [selectedFormulaire, setSelectedFormulaire] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [form] = Form.useForm();
    const [classForm] = Form.useForm();
    const [etudiantForm] = Form.useForm();
    const [profileForm] = Form.useForm();
    const [formulaireForm] = Form.useForm();
    const [questionForm] = Form.useForm();
    const [debugLogs, setDebugLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('connexion');
    const [activeManagementTab, setActiveManagementTab] = useState('utilisateurs');
    const [currentUser, setCurrentUser] = useState(null);
    const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
    const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [formPage, setFormPage] = useState(0);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        if (token && email) {
            setResetToken(token);
            setResetEmail(email);
            setResetPasswordModalVisible(true);
            setActiveTab('connexion');
        }
    }, []);

    const log = (message, data = null, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, message, data, type };
        console.log(`[${timestamp}] ${message}`, data);
        setDebugLogs(prev => [entry, ...prev].slice(0, 100));
    };

    const apiFetch = async (url, options = {}) => {
        const authToken = currentUser ? btoa(`${currentUser.email}:${currentUser.password}`) : '';
        log(`API ${options.method || 'GET'} ${url}`, options.body, 'request');
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authToken}`,
                    ...options.headers,
                },
                body: options.body ? JSON.stringify(options.body) : null,
            });
            log(`Statut de réponse: ${response.status}`, null, 'response');
            if (!response.ok) {
                const errorText = await response.text();
                log('Erreur API', { status: response.status, text: errorText }, 'error');
                throw new Error(`Erreur ${response.status}: ${errorText || 'Aucune réponse'}`);
            }
            if (response.status === 204 || response.headers.get('Content-Length') === '0') {
                log('Réponse vide reçue', null, 'response');
                return null;
            }
            const data = await response.json();
            log('Données de réponse', data, 'response');
            return data;
        } catch (error) {
            log('Erreur de récupération', error.message, 'error');
            throw error;
        }
    };

    const fetchUtilisateurs = useCallback(async () => {
        if (currentUser?.role !== 'ADMIN') return;
        log('Récupération des utilisateurs...');
        setLoading(true);
        try {
            const data = await apiFetch(UTILISATEURS_API);
            log('Utilisateurs récupérés', data);
            setUtilisateurs(data);
        } catch (error) {
            log('Échec de la récupération des utilisateurs', error.message, 'error');
            message.error('Échec du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const fetchClasses = useCallback(async () => {
        log('Récupération des classes...');
        setLoading(true);
        try {
            const data = await apiFetch(CLASSES_API);
            log('Classes récupérées', data);
            setClasses(data);
        } catch (error) {
            log('Échec de la récupération des classes', error.message, 'error');
            message.error('Échec du chargement des classes');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const fetchEtudiants = useCallback(async () => {
        log('Récupération des étudiants...');
        setLoading(true);
        try {
            const data = await apiFetch(ETUDIANTS_API);
            log('Étudiants récupérés', data);
            setEtudiants(data);
        } catch (error) {
            log('Échec de la récupération des étudiants', error.message, 'error');
            message.error('Échec du chargement des étudiants');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const fetchFormulaires = useCallback(debounce(async (page = 0, size = 10) => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;
        log('Récupération des formulaires...');
        setLoading(true);
        try {
            const data = await apiFetch(`${FORMULAIRES_API}?page=${page}&size=${size}`);
            if (data && Array.isArray(data.content)) {
                log('Formulaires récupérés', data);
                setFormulaires(data.content);
            } else {
                log('Aucune donnée formulaire valide récupérée', data, 'warning');
                setFormulaires([]);
            }
        } catch (error) {
            log('Échec de la récupération des formulaires', error.message, 'error');
            setFormulaires([]);
        } finally {
            setLoading(false);
        }
    }, 300), [currentUser]);

    const fetchEvaluatorFormulaires = useCallback(async () => {
        if (!currentUser || currentUser.role !== 'EVALUATOR') return;
        log('Récupération des formulaires pour évaluateur...');
        setLoading(true);
        try {
            const data = await apiFetch(`${FORMULAIRES_API}/evaluator/${currentUser.id}`);
            log('Formulaires pour évaluateur récupérés', data);
            setFormulaires(data || []);
        } catch (error) {
            log('Échec de la récupération des formulaires pour évaluateur', error.message, 'error');
            setFormulaires([]);
            message.error('Échec du chargement des formulaires');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const fetchQuestions = useCallback(debounce(async (formulaireId) => {
        if (!currentUser || currentUser.role !== 'ADMIN') return;
        log('Récupération des questions...');
        setLoading(true);
        try {
            const data = await apiFetch(`${QUESTIONS_API}?id_formulaire=${formulaireId}`);
            if (data && Array.isArray(data)) {
                log('Questions récupérées', data);
                setQuestions(data);
            } else {
                log('Aucune donnée question valide récupérée', data, 'warning');
                setQuestions([]);
            }
        } catch (error) {
            log('Échec de la récupération des questions', error.message, 'error');
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, 300), [currentUser]);

    const createFormulaire = async (formData) => {
        log('Création de formulaire', formData);
        try {
            const data = await apiFetch(FORMULAIRES_API, {
                method: 'POST',
                body: {
                    ...formData,
                    id_createur: currentUser.id,
                    statut: formData.statut !== undefined ? formData.statut : true,
                },
            });
            log('Formulaire créé', data);
            return data;
        } catch (error) {
            log('Échec de la création du formulaire', error.message, 'error');
            throw error;
        }
    };

    const updateFormulaire = async (id, formData) => {
        log(`Mise à jour du formulaire ${id}`, formData);
        try {
            const data = await apiFetch(`${FORMULAIRES_API}/${id}`, {
                method: 'PUT',
                body: {
                    ...formData,
                    id_createur: currentUser.id,
                    statut: formData.statut !== undefined ? formData.statut : true,
                },
            });
            log('Formulaire mis à jour', data);
            return data;
        } catch (error) {
            log('Échec de la mise à jour du formulaire', error.message, 'error');
            throw error;
        }
    };

    const deleteFormulaire = async (id) => {
        log(`Suppression du formulaire ${id}`);
        try {
            await apiFetch(`${FORMULAIRES_API}/${id}`, { method: 'DELETE' });
            log('Formulaire supprimé');
        } catch (error) {
            log('Échec de la suppression du formulaire', error.message, 'error');
            throw error;
        }
    };

    const createQuestion = async (questionData) => {
        log('Création de question', questionData);
        try {
            const data = await apiFetch(QUESTIONS_API, {
                method: 'POST',
                body: {
                    ...questionData,
                    id_formulaire: selectedFormulaire.id,
                    statut: questionData.statut !== undefined ? questionData.statut : true,
                },
            });
            log('Question créée', data);
            return data;
        } catch (error) {
            log('Échec de la création de la question', error.message, 'error');
            throw error;
        }
    };

    const updateQuestion = async (id, questionData) => {
        log(`Mise à jour de la question ${id}`, questionData);
        try {
            const data = await apiFetch(`${QUESTIONS_API}/${id}`, {
                method: 'PUT',
                body: {
                    ...questionData,
                    id_formulaire: selectedFormulaire.id,
                    statut: questionData.statut !== undefined ? questionData.statut : true,
                },
            });
            log('Question mise à jour', data);
            return data;
        } catch (error) {
            log('Échec de la mise à jour de la question', error.message, 'error');
            throw error;
        }
    };

    const deleteQuestion = async (id) => {
        log(`Suppression de la question ${id}`);
        try {
            await apiFetch(`${QUESTIONS_API}/${id}`, { method: 'DELETE' });
            log('Question supprimée');
        } catch (error) {
            log('Échec de la suppression de la question', error.message, 'error');
            throw error;
        }
    };

    const generateEvaluationLink = async (formulaireId) => {
        log('Génération du lien d\'évaluation', { id_formulaire: formulaireId });
        try {
            const data = await apiFetch(LIEN_EVALUATION_API, {
                method: 'POST',
                body: { id_formulaire: formulaireId, expiration: null },
            });
            log('Lien généré', data);
            const link = `${window.location.origin}/evaluation?token=${data.token}`;
            setGeneratedLink(link);
            return data;
        } catch (error) {
            log('Échec de la génération du lien', error.message, 'error');
            throw error;
        }
    };

    const submitEvaluation = async (formulaireId, answers) => {
        log('Soumission de l\'évaluation', { formulaireId, answers });
        try {
            const data = await apiFetch('/api/evaluation/submit', {
                method: 'POST',
                body: { formulaireId, answers },
            });
            log('Évaluation soumise', data);
            message.success('Formulaire soumis avec succès');
            setSubmissionModalVisible(false);
        } catch (error) {
            log('Échec de la soumission de l\'évaluation', error.message, 'error');
            message.error('Échec de la soumission');
        }
    };

    const handleFormulaireSubmit = async () => {
        try {
            const values = await formulaireForm.validateFields();
            log('Formulaire soumis', values);
            if (selectedFormulaire) {
                await updateFormulaire(selectedFormulaire.id, values);
                message.success('Formulaire mis à jour');
            } else {
                await createFormulaire(values);
                message.success('Formulaire créé');
            }
            setFormulaireModalVisible(false);
            fetchFormulaires(formPage, 10);
        } catch (error) {
            message.error(error.message || 'Échec');
        }
    };

    const handleQuestionSubmit = async () => {
        try {
            const values = await questionForm.validateFields();
            log('Question soumise', values);
            if (selectedQuestion) {
                await updateQuestion(selectedQuestion.id, values);
                message.success('Question mise à jour');
            } else {
                await createQuestion(values);
                message.success('Question créée');
            }
            setQuestionModalVisible(false);
            fetchQuestions(selectedFormulaire.id);
        } catch (error) {
            message.error(error.message || 'Échec');
        }
    };

    const handleDeleteFormulaire = async (id) => {
        try {
            await deleteFormulaire(id);
            message.success('Formulaire supprimé');
            fetchFormulaires(formPage, 10);
        } catch (error) {
            message.error('Échec de la suppression');
        }
    };

    const handleDeleteQuestion = async (id) => {
        try {
            await deleteQuestion(id);
            message.success('Question supprimée');
            fetchQuestions(selectedFormulaire.id);
        } catch (error) {
            message.error('Échec de la suppression');
        }
    };

    const formulaireColumns = useMemo(() => [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Titre', dataIndex: 'titre', key: 'titre' },
        { title: 'Niveau', dataIndex: 'niveau', key: 'niveau' },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: statut => (
                <Tag color={statut ? 'green' : 'red'}>
                    {statut ? 'Actif' : 'Inactif'}
                </Tag>
            ),
            width: 120,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                currentUser?.role === 'ADMIN' ? (
                    <Space>
                        <EditOutlined
                            className="text-red-500"
                            onClick={() => {
                                setSelectedFormulaire(record);
                                formulaireForm.setFieldsValue(record);
                                setFormulaireModalVisible(true);
                            }}
                        />
                        <Popconfirm
                            title="Êtes-vous sûr de supprimer ce formulaire?"
                            onConfirm={() => handleDeleteFormulaire(record.id)}
                            okText="Oui"
                            cancelText="Non"
                        >
                            <DeleteOutlined className="text-red-500" />
                        </Popconfirm>
                        <LinkOutlined
                            className="text-red-500"
                            onClick={() => {
                                setSelectedFormulaire(record);
                                setLinkModalVisible(true);
                                generateEvaluationLink(record.id);
                            }}
                        />
                    </Space>
                ) : (
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedFormulaire(record);
                            fetchQuestions(record.id);
                            setSubmissionModalVisible(true);
                        }}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Remplir
                    </Button>
                )
            ),
        },
    ], [currentUser]);

    const questionColumns = useMemo(() => [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Libellé', dataIndex: 'libelle', key: 'libelle' },
        { title: 'Barème', dataIndex: 'bareme', key: 'bareme' },
        { title: 'Pondération', dataIndex: 'ponderation', key: 'ponderation' },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: statut => (
                <Tag color={statut ? 'green' : 'red'}>
                    {statut ? 'Actif' : 'Inactif'}
                </Tag>
            ),
            width: 120,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                currentUser?.role === 'ADMIN' && (
                    <Space>
                        <EditOutlined
                            className="text-red-500"
                            onClick={() => {
                                setSelectedQuestion(record);
                                questionForm.setFieldsValue(record);
                                setQuestionModalVisible(true);
                            }}
                        />
                        <Popconfirm
                            title="Êtes-vous sûr de supprimer cette question?"
                            onConfirm={() => handleDeleteQuestion(record.id)}
                            okText="Oui"
                            cancelText="Non"
                        >
                            <DeleteOutlined className="text-red-500" />
                        </Popconfirm>
                    </Space>
                )
            ),
        },
    ], [currentUser]);

    const createUser = async (userData) => {
        log('Création d\'utilisateur', userData);
        try {
            const data = await apiFetch(UTILISATEURS_API, {
                method: 'POST',
                body: { ...userData, password: userData.motDePasse },
            });
            log('Utilisateur créé', data);
            return data;
        } catch (error) {
            log('Échec de la création de l\'utilisateur', error.message, 'error');
            throw error;
        }
    };

    const updateUser = async (id, userData) => {
        log(`Mise à jour de l\'utilisateur ${id}`, userData);
        try {
            const data = await apiFetch(`${UTILISATEURS_API}/${id}`, {
                method: 'PUT',
                body: { ...userData, password: userData.motDePasse },
            });
            log('Utilisateur mis à jour', data);
            return data;
        } catch (error) {
            log('Échec de la mise à jour de l\'utilisateur', error.message, 'error');
            throw error;
        }
    };

    const deleteUser = async (id) => {
        log(`Suppression de l\'utilisateur ${id}`);
        try {
            await apiFetch(`${UTILISATEURS_API}/${id}`, { method: 'DELETE' });
            log('Utilisateur supprimé');
        } catch (error) {
            log('Échec de la suppression de l\'utilisateur', error.message, 'error');
            throw error;
        }
    };

    const createClass = async (classData) => {
        log('Création de classe', classData);
        try {
            const data = await apiFetch(CLASSES_API, { method: 'POST', body: classData });
            log('Classe créée', data);
            return data;
        } catch (error) {
            log('Échec de la création de la classe', error.message, 'error');
            throw error;
        }
    };

    const updateClass = async (id, classData) => {
        log(`Mise à jour de la classe ${id}`, classData);
        try {
            const data = await apiFetch(`${CLASSES_API}/${id}`, { method: 'PUT', body: classData });
            log('Classe mise à jour', data);
            return data;
        } catch (error) {
            log('Échec de la mise à jour de la classe', error.message, 'error');
            throw error;
        }
    };

    const deleteClass = async (id) => {
        log(`Suppression de la classe ${id}`);
        try {
            await apiFetch(`${CLASSES_API}/${id}`, { method: 'DELETE' });
            log('Classe supprimée');
        } catch (error) {
            log('Échec de la suppression de la classe', error.message, 'error');
            throw error;
        }
    };

    const createEtudiant = async (etudiantData) => {
        log('Création d\'étudiant', etudiantData);
        try {
            const data = await apiFetch(ETUDIANTS_API, { method: 'POST', body: etudiantData });
            log('Étudiant créé', data);
            return data;
        } catch (error) {
            log('Échec de la création de l\'étudiant', error.message, 'error');
            throw error;
        }
    };

    const updateEtudiant = async (id, etudiantData) => {
        log(`Mise à jour de l\'étudiant ${id}`, etudiantData);
        try {
            const data = await apiFetch(`${ETUDIANTS_API}/${id}`, { method: 'PUT', body: etudiantData });
            log('Étudiant mis à jour', data);
            return data;
        } catch (error) {
            log('Échec de la mise à jour de l\'étudiant', error.message, 'error');
            throw error;
        }
    };

    const deleteEtudiant = async (id) => {
        log(`Suppression de l\'étudiant ${id}`);
        try {
            await apiFetch(`${ETUDIANTS_API}/${id}`, { method: 'DELETE' });
            log('Étudiant supprimé');
        } catch (error) {
            log('Échec de la suppression de l\'étudiant', error.message, 'error');
            throw error;
        }
    };

    const updateCurrentUser = async (userData) => {
        log('Mise à jour de l\'utilisateur actuel', userData);
        try {
            const data = await apiFetch(`${UTILISATEURS_API}/me`, {
                method: 'PUT',
                body: { ...userData, password: userData.motDePasse },
            });
            log('Utilisateur actuel mis à jour', data);
            return data;
        } catch (error) {
            log('Échec de la mise à jour de l\'utilisateur actuel', error.message, 'error');
            throw error;
        }
    };

    const loginUser = async (credentials) => {
        log('Connexion', credentials);
        try {
            const data = await apiFetch(`${UTILISATEURS_API}/login`, {
                method: 'POST',
                body: { ...credentials, password: credentials.motDePasse },
            });
            log('Connexion réussie', data);
            return data;
        } catch (error) {
            log('Échec de la connexion', error.message, 'error');
            throw error;
        }
    };

    const handleForgotPassword = async () => {
        try {
            if (!forgotPasswordEmail) {
                message.warning('Veuillez entrer votre email en premier');
                return;
            }
            log('Demande de réinitialisation du mot de passe pour l\'email:', forgotPasswordEmail);
            const response = await fetch(`${UTILISATEURS_API}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });
            if (!response.ok) throw new Error('Échec de la demande de réinitialisation du mot de passe');
            const data = await response.json();
            log('Réponse de réinitialisation du mot de passe:', data);
            message.success(data.message || 'Instructions de réinitialisation envoyées à votre email');
            setForgotPasswordModalVisible(false);
        } catch (error) {
            log('Erreur de mot de passe oublié:', error.message, 'error');
            message.error(error.message || 'Échec de la demande de réinitialisation');
        }
    };

    const handleResetPassword = async (values) => {
        try {
            const { newPassword, confirmPassword } = values;
            if (newPassword !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas');
            const response = await fetch(`${UTILISATEURS_API}/reinitialiser-mot-de-passe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail, token: resetToken, newPassword }),
            });
            if (!response.ok) throw new Error('Échec de la réinitialisation du mot de passe');
            const data = await response.json();
            log('Réponse de réinitialisation du mot de passe:', data);
            message.success(data.message || 'Mot de passe réinitialisé avec succès');
            setResetPasswordModalVisible(false);
        } catch (error) {
            log('Erreur de réinitialisation du mot de passe:', error.message, 'error');
            message.error(error.message || 'Échec de la réinitialisation du mot de passe');
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('utilisateur');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setUserName(user.nom);
            log('Utilisateur chargé depuis le stockage', user);
        }
    }, [setUserName]);

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'ADMIN') {
                fetchUtilisateurs();
                fetchClasses();
                fetchEtudiants();
                fetchFormulaires(0, 10);
            } else if (currentUser.role === 'EVALUATOR') {
                fetchEvaluatorFormulaires();
            }
        }
    }, [currentUser, fetchUtilisateurs, fetchClasses, fetchEtudiants, fetchFormulaires, fetchEvaluatorFormulaires]);

    const handleDeleteUser = async (id) => {
        try {
            await deleteUser(id);
            message.success('Utilisateur supprimé avec succès');
            fetchUtilisateurs();
        } catch (error) {
            message.error('Échec de la suppression de l\'utilisateur');
        }
    };

    const handleDeleteClass = async (id) => {
        try {
            await deleteClass(id);
            message.success('Classe supprimée avec succès');
            fetchClasses();
        } catch (error) {
            message.error('Échec de la suppression de la classe');
        }
    };

    const handleDeleteEtudiant = async (id) => {
        try {
            await deleteEtudiant(id);
            message.success('Étudiant supprimé avec succès');
            fetchEtudiants();
        } catch (error) {
            message.error('Échec de la suppression de l\'étudiant');
        }
    };

    const handleUserSubmit = async () => {
        try {
            const values = await form.validateFields();
            log('Formulaire utilisateur soumis', values);
            if (selectedUser) {
                await updateUser(selectedUser.id, { ...values, password: values.motDePasse });
                message.success('Utilisateur mis à jour avec succès');
            } else {
                await createUser({ ...values, password: values.motDePasse });
                message.success('Utilisateur créé avec succès');
            }
            setModalVisible(false);
            fetchUtilisateurs();
        } catch (error) {
            message.error(error.message || 'Opération échouée');
        }
    };

    const handleClassSubmit = async () => {
        try {
            const values = await classForm.validateFields();
            log('Formulaire classe soumis', values);
            if (selectedClass) {
                await updateClass(selectedClass.id, values);
                message.success('Classe mise à jour avec succès');
            } else {
                await createClass(values);
                message.success('Classe créée avec succès');
            }
            setClassModalVisible(false);
            fetchClasses();
        } catch (error) {
            message.error(error.message || 'Opération échouée');
        }
    };

    const handleEtudiantSubmit = async () => {
        try {
            const values = await etudiantForm.validateFields();
            log('Formulaire étudiant soumis', values);
            const etudiantData = {
                nom: values.nom,
                email: values.email,
                ...(values.classe && { classe: { id: Number(values.classe) } }),
            };
            if (selectedEtudiant) {
                await updateEtudiant(selectedEtudiant.id, etudiantData);
                message.success('Étudiant mis à jour avec succès');
            } else {
                await createEtudiant(etudiantData);
                message.success('Étudiant créé avec succès');
            }
            setEtudiantModalVisible(false);
            fetchEtudiants();
        } catch (error) {
            message.error(error.message || 'Opération échouée');
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const values = await profileForm.validateFields();
            log('Formulaire profil soumis', values);
            const updatedUser = await updateCurrentUser({ ...values, password: values.motDePasse });
            setCurrentUser(updatedUser);
            setUserName(updatedUser.nom);
            localStorage.setItem('utilisateur', JSON.stringify(updatedUser));
            message.success('Profil mis à jour avec succès');
            setProfileModalVisible(false);
        } catch (error) {
            message.error(error.message || 'Échec de la mise à jour du profil');
        }
    };

    const handleLogin = async (values) => {
        try {
            const user = await loginUser({ email: values.email, motDePasse: values.motDePasse });
            setCurrentUser(user);
            setUserName(user.nom);
            localStorage.setItem('utilisateur', JSON.stringify(user));
            message.success('Connexion réussie');
        } catch (error) {
            message.error(error.message || 'Échec de la connexion');
        }
    };

    const handleRegister = async (values) => {
        try {
            const { confirmMotDePasse, ...userData } = values;
            if (values.motDePasse !== values.confirmMotDePasse) throw new Error('Les mots de passe ne correspondent pas');
            log('Données envoyées pour inscription', { ...userData, password: values.motDePasse, role: values.role });
            await createUser({ ...userData, password: values.motDePasse, role: values.role });
            message.success('Compte créé avec succès');
            setActiveTab('connexion');
            form.resetFields();
        } catch (error) {
            log('Échec de l\'inscription', error.message, 'error');
            message.error(error.message || 'Échec de l\'inscription');
        }
    };

    if (!currentUser) {
        return (
            <div className="content-container">
                <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 180px)' }}>
                    <Col xs={22} sm={18} md={14} lg={10}>
                        <Card className="auth-card">
                            <Title level={2} style={{ textAlign: 'center', color: '#1f2937', marginBottom: '2rem' }}>
                                <TeamOutlined className="text-red-500 text-3xl mr-2" />
                                Système de Gestion des Évaluations
                            </Title>
                            <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
                                <TabPane tab="Connexion" key="connexion">
                                    <Form
                                        form={form}
                                        name="login"
                                        onFinish={handleLogin}
                                        layout="vertical"
                                        initialValues={{ remember: true }}
                                        requiredMark={false}
                                        className="fade-in"
                                    >
                                        <Form.Item
                                            name="email"
                                            label={<span className="text-gray-700 font-medium">Adresse Email</span>}
                                            rules={[{ required: true, message: 'Veuillez entrer votre email!' }, { type: 'email', message: 'Veuillez entrer un email valide!' }]}
                                        >
                                            <Input
                                                prefix={<MailOutlined className="text-red-500" />}
                                                placeholder="exemple@esprit.tn"
                                                size="large"
                                                className="rounded-lg transition-all duration-300"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="motDePasse"
                                            label={<span className="text-gray-700 font-medium">Mot de Passe</span>}
                                            rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined className="text-red-500" />}
                                                placeholder="••••••••"
                                                size="large"
                                                className="rounded-lg transition-all duration-300"
                                            />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
                                                className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg mt-4 transition-all duration-300"
                                                icon={<LockOutlined />}
                                            >
                                                Se Connecter
                                            </Button>
                                            <div className="text-right mt-2">
                                                <a
                                                    onClick={() => setForgotPasswordModalVisible(true)}
                                                    className="text-red-500 hover:text-red-600 text-sm transition-colors duration-300"
                                                >
                                                    Mot de passe oublié ?
                                                </a>
                                            </div>
                                        </Form.Item>
                                    </Form>
                                </TabPane>
                                <TabPane tab="Inscription" key="inscription">
                                    <Form
                                        form={form}
                                        name="register"
                                        onFinish={handleRegister}
                                        layout="vertical"
                                        requiredMark={false}
                                        className="fade-in"
                                    >
                                        <Form.Item
                                            name="nom"
                                            label={<span className="text-gray-700 font-medium">Nom Complet</span>}
                                            rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
                                        >
                                            <Input
                                                prefix={<UserOutlined className="text-red-500" />}
                                                placeholder="John Doe"
                                                size="large"
                                                className="rounded-lg transition-all duration-300"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="email"
                                            label={<span className="text-gray-700 font-medium">Adresse Email</span>}
                                            rules={[{ required: true, message: 'Veuillez entrer votre email!' }, { type: 'email', message: 'Veuillez entrer un email valide!' }]}
                                        >
                                            <Input
                                                prefix={<MailOutlined className="text-red-500" />}
                                                placeholder="exemple@esprit.tn"
                                                size="large"
                                                className="rounded-lg transition-all duration-300"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="motDePasse"
                                            label={<span className="text-gray-700 font-medium">Mot de Passe</span>}
                                            rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }, { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères!' }]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined className="text-red-500" />}
                                                placeholder="••••••••"
                                                size="large"
                                                className="rounded-lg transition-all duration-300"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="confirmMotDePasse"
                                            label={<span className="text-gray-700 font-medium">Confirmer Mot de Passe</span>}
                                            dependencies={['motDePasse']}
                                            rules={[
                                                { required: true, message: 'Veuillez confirmer votre mot de passe!' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue('motDePasse') === value) return Promise.resolve();
                                                        return Promise.reject(new Error('Les mots de passe ne correspondent pas!'));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password
                                                prefix={<LockOutlined className="text-red-500" />}
                                                placeholder="••••••••"
                                                size="large"
                                                className="rounded-lg transition-all duration-300"
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            name="role"
                                            label={<span className="text-gray-700 font-medium">Rôle</span>}
                                            rules={[{ required: true, message: 'Veuillez sélectionner un rôle!' }]}
                                        >
                                            <Select
                                                size="large"
                                                placeholder="Sélectionner un rôle"
                                                className="rounded-lg transition-all duration-300"
                                            >
                                                <Option value="ADMIN">Administrateur</Option>
                                                <Option value="EVALUATOR">Évaluateur</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
                                                className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg mt-4 transition-all duration-300"
                                                icon={<UserSwitchOutlined />}
                                            >
                                                S'inscrire
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>
                            </Tabs>
                        </Card>

                        <Modal
                            title={<span><MailOutlined className="text-red-500 mr-2" /> Réinitialiser le mot de passe</span>}
                            open={forgotPasswordModalVisible}
                            onCancel={() => setForgotPasswordModalVisible(false)}
                            footer={null}
                            destroyOnClose
                        >
                            <Form layout="vertical" onFinish={handleForgotPassword}>
                                <Form.Item
                                    label="Adresse email"
                                    rules={[{ required: true, message: 'Veuillez entrer votre email!' }, { type: 'email', message: 'Veuillez entrer un email valide' }]}
                                >
                                    <Input
                                        prefix={<MailOutlined className="text-red-500" />}
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        placeholder="Entrez votre email enregistré"
                                        size="large"
                                        className="rounded-lg transition-all duration-300"
                                    />
                                </Form.Item>
                                <Alert
                                    message="Vous recevrez un email avec des instructions pour réinitialiser votre mot de passe."
                                    type="info"
                                    showIcon
                                    className="mb-4 rounded-lg"
                                />
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg transition-all duration-300"
                                        icon={<MailOutlined />}
                                    >
                                        Envoyer le lien de réinitialisation
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Modal>

                        <Modal
                            title={<span><LockOutlined className="text-red-500 mr-2" /> Définir un nouveau mot de passe</span>}
                            open={resetPasswordModalVisible}
                            onCancel={() => setResetPasswordModalVisible(false)}
                            footer={null}
                            destroyOnClose
                        >
                            <Form layout="vertical" onFinish={handleResetPassword}>
                                <Form.Item
                                    name="newPassword"
                                    label="Nouveau mot de passe"
                                    rules={[{ required: true, message: 'Veuillez entrer votre nouveau mot de passe!' }]}
                                >
                                    <Input.Password prefix={<LockOutlined className="text-red-500" />} size="large" className="rounded-lg transition-all duration-300" />
                                </Form.Item>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirmer le mot de passe"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Veuillez confirmer votre mot de passe!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                                                return Promise.reject(new Error('Les deux mots de passe ne correspondent pas!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password prefix={<LockOutlined className="text-red-500" />} size="large" className="rounded-lg transition-all duration-300" />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg transition-all duration-300"
                                        icon={<LockOutlined />}
                                    >
                                        Réinitialiser le mot de passe
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Modal>
                    </Col>
                </Row>
            </div>
        );
    }

    if (currentUser?.role === 'EVALUATOR') {
        return (
            <div className="content-container">
                <div className="flex justify-between mb-6">
                    <Title level={3} style={{ color: '#1f2937' }}>
                        <UserSwitchOutlined className="text-red-500 mr-2" />
                        Tableau de Bord des Évaluations
                    </Title>
                    <Space>
                        <UserOutlined
                            className="text-red-500"
                            onClick={() => {
                                setProfileModalVisible(true);
                                profileForm.setFieldsValue(currentUser);
                            }}
                        />
                        <LogoutOutlined
                            className="text-red-500"
                            onClick={onLogout}
                            style={{ fontSize: '1.5rem' }}
                        />
                    </Space>
                </div>
                <Card className="ant-card">
                    <Title level={4}>Formulaires Assignés</Title>
                    <Table
                        columns={formulaireColumns}
                        dataSource={formulaires}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        size="middle"
                    />
                </Card>

                <Modal
                    title={<span><UserOutlined className="text-red-500 mr-2" /> Modifier le Profil</span>}
                    open={profileModalVisible}
                    onCancel={() => setProfileModalVisible(false)}
                    footer={null}
                    destroyOnClose
                >
                    <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
                        <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
                            <Input prefix={<UserOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[{ required: true, type: 'email' }]}
                        >
                            <Input prefix={<MailOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                        </Form.Item>
                        <Form.Item
                            name="motDePasse"
                            label="Mot de passe (laisser vide pour conserver l'actuel)"
                            extra="Doit comporter au moins 6 caractères"
                        >
                            <Input.Password prefix={<LockOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                                icon={<UserSwitchOutlined />}
                            >
                                Sauvegarder le Profil
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={<span><BookOutlined className="text-red-500 mr-2" /> Remplir Formulaire</span>}
                    open={submissionModalVisible}
                    onCancel={() => setSubmissionModalVisible(false)}
                    footer={null}
                    destroyOnClose
                >
                    <Form layout="vertical" onFinish={(values) => submitEvaluation(selectedFormulaire.id, values)}>
                        {questions.map((q) => (
                            <Form.Item
                                key={q.id}
                                name={`q_${q.id}`}
                                label={q.libelle}
                                rules={[{ required: true, message: 'Veuillez répondre à cette question!' }]}
                            >
                                <Input placeholder="Votre réponse" />
                            </Form.Item>
                        ))}
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                                icon={<BookOutlined />}
                            >
                                Soumettre
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }

    return (
        <div className="content-container">
            <div className="flex justify-between mb-6">
                <Title level={3} style={{ color: '#1f2937' }}>
                    <TeamOutlined className="text-red-500 mr-2" />
                    Panneau de Gestion Administrateur
                </Title>
                <Space>
                    <Text strong className="text-gray-600">{currentUser.nom} (Administrateur)</Text>
                    <UserOutlined
                        className="text-red-500"
                        onClick={() => {
                            setProfileModalVisible(true);
                            profileForm.setFieldsValue(currentUser);
                        }}
                    />
                    <LogoutOutlined
                        className="text-red-500"
                        onClick={onLogout}
                        style={{ fontSize: '1.5rem' }}
                    />
                </Space>
            </div>

            <Tabs
                activeKey={activeManagementTab}
                onChange={setActiveManagementTab}
                className="mb-6"
            >
                <TabPane tab={<span><UserOutlined className="text-red-500 mr-2" /> Utilisateurs</span>} key="utilisateurs" />
                <TabPane tab={<span><BookOutlined className="text-red-500 mr-2" /> Classes</span>} key="classes" />
                <TabPane tab={<span><TeamOutlined className="text-red-500 mr-2" /> Étudiants</span>} key="etudiants" />
                <TabPane tab={<span><BookOutlined className="text-red-500 mr-2" /> Formulaires</span>} key="formulaires" />
            </Tabs>

            {activeManagementTab === 'utilisateurs' && (
                <Card className="ant-card">
                    <div className="flex justify-between mb-4">
                        <PlusCircleOutlined
                            className="text-red-500"
                            onClick={() => {
                                setSelectedUser(null);
                                form.resetFields();
                                setModalVisible(true);
                            }}
                        />
                    </div>
                    <Table
                        columns={[
                            { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                            { title: 'Nom', dataIndex: 'nom', key: 'nom' },
                            { title: 'Email', dataIndex: 'email', key: 'email' },
                            {
                                title: 'Rôle',
                                dataIndex: 'role',
                                key: 'role',
                                render: role => (
                                    <Tag color={role === 'ADMIN' ? 'red' : 'purple'}>
                                        {role?.toUpperCase()}
                                    </Tag>
                                ),
                                width: 120,
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                width: 150,
                                render: (_, record) => (
                                    <Space>
                                        <EditOutlined
                                            className="text-red-500"
                                            onClick={() => {
                                                setSelectedUser(record);
                                                form.setFieldsValue(record);
                                                setModalVisible(true);
                                            }}
                                        />
                                        <Popconfirm
                                            title="Êtes-vous sûr de supprimer cet utilisateur?"
                                            onConfirm={() => handleDeleteUser(record.id)}
                                            okText="Oui"
                                            cancelText="Non"
                                        >
                                            <DeleteOutlined className="text-red-500" />
                                        </Popconfirm>
                                    </Space>
                                ),
                            },
                        ]}
                        dataSource={utilisateurs}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        size="middle"
                    />
                </Card>
            )}

            {activeManagementTab === 'classes' && (
                <Card className="ant-card">
                    <div className="flex justify-between mb-4">
                        <PlusCircleOutlined
                            className="text-red-500"
                            onClick={() => {
                                setSelectedClass(null);
                                classForm.resetFields();
                                setClassModalVisible(true);
                            }}
                        />
                    </div>
                    <Table
                        columns={[
                            { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                            { title: 'Nom de la Classe', dataIndex: 'nom', key: 'nom' },
                            {
                                title: 'Actions',
                                key: 'actions',
                                width: 150,
                                render: (_, record) => (
                                    <Space>
                                        <EditOutlined
                                            className="text-red-500"
                                            onClick={() => {
                                                setSelectedClass(record);
                                                classForm.setFieldsValue(record);
                                                setClassModalVisible(true);
                                            }}
                                        />
                                        <Popconfirm
                                            title="Êtes-vous sûr de supprimer cette classe?"
                                            onConfirm={() => handleDeleteClass(record.id)}
                                            okText="Oui"
                                            cancelText="Non"
                                        >
                                            <DeleteOutlined className="text-red-500" />
                                        </Popconfirm>
                                    </Space>
                                ),
                            },
                        ]}
                        dataSource={classes}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        size="middle"
                    />
                </Card>
            )}

            {activeManagementTab === 'etudiants' && (
                <Card className="ant-card">
                    <div className="flex justify-between mb-4">
                        <PlusCircleOutlined
                            className="text-red-500"
                            onClick={() => {
                                setSelectedEtudiant(null);
                                etudiantForm.resetFields();
                                setEtudiantModalVisible(true);
                            }}
                        />
                    </div>
                    <Table
                        columns={[
                            { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
                            { title: 'Nom', dataIndex: 'nom', key: 'nom' },
                            { title: 'Email', dataIndex: 'email', key: 'email' },
                            {
                                title: 'Classe',
                                dataIndex: 'classe',
                                key: 'classe',
                                render: (classe) => {
                                    const classObj = classes.find(c => c.id === classe?.id);
                                    return classObj ? classObj.nom : 'N/A';
                                },
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                width: 150,
                                render: (_, record) => (
                                    <Space>
                                        <EditOutlined
                                            className="text-red-500"
                                            onClick={() => {
                                                setSelectedEtudiant(record);
                                                etudiantForm.setFieldsValue({
                                                    ...record,
                                                    classe: record.classe?.id?.toString(),
                                                });
                                                setEtudiantModalVisible(true);
                                            }}
                                        />
                                        <Popconfirm
                                            title="Êtes-vous sûr de supprimer cet étudiant?"
                                            onConfirm={() => handleDeleteEtudiant(record.id)}
                                            okText="Oui"
                                            cancelText="Non"
                                        >
                                            <DeleteOutlined className="text-red-500" />
                                        </Popconfirm>
                                    </Space>
                                ),
                            },
                        ]}
                        dataSource={etudiants}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        size="middle"
                    />
                </Card>
            )}

            {activeManagementTab === 'formulaires' && (
                <Card className="ant-card">
                    <div className="flex justify-between mb-4">
                        <PlusCircleOutlined
                            className="text-red-500"
                            onClick={() => {
                                setSelectedFormulaire(null);
                                formulaireForm.resetFields();
                                setFormulaireModalVisible(true);
                            }}
                        />
                    </div>
                    <Table
                        columns={formulaireColumns}
                        dataSource={formulaires}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: formPage + 1,
                            pageSize: 10,
                            onChange: (page) => {
                                setFormPage(page - 1);
                                fetchFormulaires(page - 1, 10);
                            },
                        }}
                        size="middle"
                    />
                    {selectedFormulaire && (
                        <div className="mt-4">
                            <Title level={4}>Questions du Formulaire</Title>
                            <PlusCircleOutlined
                                className="text-red-500 mb-2"
                                onClick={() => {
                                    setSelectedQuestion(null);
                                    questionForm.resetFields();
                                    setQuestionModalVisible(true);
                                }}
                            />
                            <Table
                                columns={questionColumns}
                                dataSource={questions}
                                rowKey="id"
                                loading={loading}
                                pagination={false}
                                size="middle"
                            />
                        </div>
                    )}
                </Card>
            )}

            <Modal
                title={<span><UserSwitchOutlined className="text-red-500 mr-2" /> {selectedUser ? 'Modifier Utilisateur' : 'Créer Utilisateur'}</span>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                destroyOnClose
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleUserSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="nom"
                                label="Nom complet"
                                rules={[{ required: true }]}
                            >
                                <Input prefix={<UserOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, type: 'email' }]}
                            >
                                <Input prefix={<MailOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="motDePasse"
                                label="Mot de passe"
                                rules={[{ required: !selectedUser, message: 'Veuillez entrer le mot de passe!' }]}
                            >
                                <Input.Password prefix={<LockOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Rôle"
                                rules={[{ required: true }]}
                            >
                                <Select size="large" className="rounded-lg">
                                    <Option value="ADMIN">Administrateur</Option>
                                    <Option value="EVALUATOR">Évaluateur</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                            icon={<UserSwitchOutlined />}
                        >
                            {selectedUser ? 'Mettre à jour' : 'Créer'} Utilisateur
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><BookOutlined className="text-red-500 mr-2" /> {selectedClass ? 'Modifier Classe' : 'Créer Classe'}</span>}
                open={classModalVisible}
                onCancel={() => setClassModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={classForm} layout="vertical" onFinish={handleClassSubmit}>
                    <Form.Item
                        name="nom"
                        label="Nom de la Classe"
                        rules={[{ required: true, message: 'Veuillez entrer le nom de la classe!' }]}
                    >
                        <Input prefix={<BookOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                            icon={<BookOutlined />}
                        >
                            {selectedClass ? 'Mettre à jour' : 'Créer'} Classe
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><TeamOutlined className="text-red-500 mr-2" /> {selectedEtudiant ? 'Modifier Étudiant' : 'Créer Étudiant'}</span>}
                open={etudiantModalVisible}
                onCancel={() => setEtudiantModalVisible(false)}
                footer={null}
                destroyOnClose
                width={600}
            >
                <Form form={etudiantForm} layout="vertical" onFinish={handleEtudiantSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="nom"
                                label="Nom"
                                rules={[{ required: true, message: 'Veuillez entrer le nom!' }]}
                            >
                                <Input prefix={<UserOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, type: 'email', message: 'Veuillez entrer un email valide!' }]}
                            >
                                <Input prefix={<MailOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="classe"
                                label="Classe"
                            >
                                <Select size="large" placeholder="Sélectionner une classe" allowClear className="rounded-lg">
                                    {classes.map(cls => (
                                        <Option key={cls.id} value={cls.id.toString()}>{cls.nom}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                            icon={<TeamOutlined />}
                        >
                            {selectedEtudiant ? 'Mettre à jour' : 'Créer'} Étudiant
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><UserOutlined className="text-red-500 mr-2" /> Modifier le Profil</span>}
                open={profileModalVisible}
                onCancel={() => setProfileModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
                    <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
                        <Input prefix={<UserOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: 'email' }]}
                    >
                        <Input prefix={<MailOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item
                        name="motDePasse"
                        label="Mot de passe (laisser vide pour conserver l'actuel)"
                        extra="Doit comporter au moins 6 caractères"
                    >
                        <Input.Password prefix={<LockOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                            icon={<UserSwitchOutlined />}
                        >
                            Sauvegarder le Profil
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><BookOutlined className="text-red-500 mr-2" /> Créer un Formulaire d'Évaluation</span>}
                open={formulaireModalVisible}
                onCancel={() => setFormulaireModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={formulaireForm} layout="vertical" onFinish={handleFormulaireSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="titre"
                                label="Titre"
                                rules={[{ required: true }]}
                            >
                                <Input prefix={<BookOutlined className="text-red-500" />} size="large" className="rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="niveau"
                                label="Niveau Académique"
                                rules={[{ required: true }]}
                            >
                                <Select size="large" className="rounded-lg">
                                    <Option value="L1">L1</Option>
                                    <Option value="L2">L2</Option>
                                    <Option value="L3">L3</Option>
                                    <Option value="MASTER">Master</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={4} className="rounded-lg" />
                    </Form.Item>
                    <Form.Item
                        name="statut"
                        label="Statut"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Actif" unCheckedChildren="Inactif" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                            icon={<BookOutlined />}
                        >
                            {selectedFormulaire ? 'Mettre à jour' : 'Créer'} Formulaire
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><QuestionOutlined className="text-red-500 mr-2" /> {selectedQuestion ? 'Modifier Question' : 'Créer Question'}</span>}
                open={questionModalVisible}
                onCancel={() => setQuestionModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={questionForm} layout="vertical" onFinish={handleQuestionSubmit}>
                    <Form.Item
                        name="libelle"
                        label="Libellé"
                        rules={[{ required: true }]}
                    >
                        <Input.TextArea rows={3} className="rounded-lg" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="bareme"
                                label="Barème"
                                rules={[{ required: true, type: 'number', min: 0 }]}
                            >
                                <InputNumber size="large" className="w-full rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ponderation"
                                label="Pondération"
                                rules={[{ required: true, type: 'number', min: 0, max: 1 }]}
                            >
                                <InputNumber size="large" className="w-full rounded-lg" step={0.1} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="statut"
                        label="Statut"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Actif" unCheckedChildren="Inactif" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                            icon={<QuestionOutlined />}
                        >
                            {selectedQuestion ? 'Mettre à jour' : 'Créer'} Question
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><LinkOutlined className="text-red-500 mr-2" /> Générer Lien d'Évaluation</span>}
                open={linkModalVisible}
                onCancel={() => setLinkModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Input
                    value={generatedLink}
                    readOnly
                    addonAfter={<CopyOutlined onClick={() => navigator.clipboard.writeText(generatedLink)} />}
                    size="large"
                    className="rounded-lg mb-4"
                />
                <Form layout="vertical">
                    <Form.Item
                        name="expiration"
                        label="Expiration (optionnel)"
                    >
                        <DatePicker showTime size="large" className="w-full rounded-lg" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            onClick={async () => {
                                if (selectedFormulaire) await generateEvaluationLink(selectedFormulaire.id);
                            }}
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                            icon={<LinkOutlined />}
                        >
                            Régénérer Lien
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;