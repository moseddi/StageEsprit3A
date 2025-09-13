import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Modal, Form, Input, Switch, Space, Popconfirm, Button, message, Progress, Tag, Alert, DatePicker, Select, Row, Col, InputNumber,
    Spin, notification, Tooltip, Typography, Descriptions, Collapse, Card
} from 'antd';
import {
    PlusCircleOutlined, EditOutlined, DeleteOutlined, LinkOutlined, CopyOutlined, QuestionOutlined,
    InfoCircleOutlined, FilePdfOutlined, FileExcelOutlined, CopyTwoTone, MailOutlined, BarChartOutlined, SearchOutlined
} from '@ant-design/icons';
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import moment from "moment";
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import {
    fetchFormulaires, createFormulaire, updateFormulaire, deleteFormulaire, fetchEVALUATEURFormulaires,
    generateEvaluationLink, submitEvaluation, fetchQuestions, fetchEvaluationLink
} from '../services/apiService';
import QuestionManagement from './QuestionManagement';
import axios from 'axios';
import { Bar, Pie } from '@ant-design/plots';

const { Option } = Select;
const { Text, Title } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

const FormManagement = ({ currentUser, theme }) => {
    const location = useLocation();
    const [formulaires, setFormulaires] = useState([]);
    const [filteredFormulaires, setFilteredFormulaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formulaireModalVisible, setFormulaireModalVisible] = useState(false);
    const [selectedFormulaire, setSelectedFormulaire] = useState(null);
    const [form] = Form.useForm();
    const [evaluationToken, setEvaluationToken] = useState(null);
    const [linkModalVisible, setLinkModalVisible] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [expirationDate, setExpirationDate] = useState(null);
    const [questionManagementModalVisible, setQuestionManagementModalVisible] = useState(false);
    const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
    const [submissionData, setSubmissionData] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [questionsForSubmission, setQuestionsForSubmission] = useState([]);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [formDetails, setFormDetails] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [EVALUATEURs, setEVALUATEURs] = useState([]);
    const [emailForm] = Form.useForm();
    const [errorMessage, setErrorMessage] = useState(null);
    const [mesReponses, setMesReponses] = useState([]);
    const [mesReponsesModalVisible, setMesReponsesModalVisible] = useState(false);
    const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
    const [formStatistics, setFormStatistics] = useState([]);
    const [completionStatsModalVisible, setCompletionStatsModalVisible] = useState(false);
    const navigate = useNavigate();
    const [selectedReponse, setSelectedReponse] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [stats, setStats] = useState({ formulairesRemplis: 0, formulairesNonRemplis: 0 });
    const [questionStats, setQuestionStats] = useState({ questionsRepondues: 0, questionsEnCours: 0 });
    const [journalVisible, setJournalVisible] = useState(false);
    const [journalData, setJournalData] = useState([]);
    const [journalSearch, setJournalSearch] = useState('');
    const [journalDateRange, setJournalDateRange] = useState(null);

    // Calculate progress for the submission modal
    const calculateProgress = () => {
        if (!submissionData || !questionsForSubmission.length) return 0;
        const total = questionsForSubmission.length;
        const answered = Object.entries(userAnswers).filter(([_, value]) => value && value.trim() !== '').length;
        return Math.round((answered / total) * 100);
    };

    // Force re-render of progress when userAnswers changes
    useEffect(() => {
        form.setFieldsValue(
            questionsForSubmission.reduce((acc, question) => ({
                ...acc,
                [`question_${question.id}`]: userAnswers[question.id] || '',
            }), {})
        );
    }, [userAnswers, questionsForSubmission, form]);

    const styles = {
        primaryColor: '#c8102e',
        secondaryColor: '#991b1b',
        containerStyle: { padding: '10px', borderRadius: '12px', background: theme === 'light' ? '#ffffff' : '#1f1f1f', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' },
        modalStyle: { borderRadius: '12px', background: theme === 'light' ? '#ffffff' : '#2d2d2d', padding: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' },
        buttonStyle: { background: '#c8102e', color: '#ffffff', borderRadius: '8px', transition: 'all 0.3s ease', padding: '6px 12px', fontSize: '14px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        iconButtonStyle: { background: '#c8102e', color: '#ffffff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s ease, background 0.3s ease', border: 'none' },
        inputStyle: { borderRadius: '8px', borderColor: '#c8102e', transition: 'all 0.3s ease', background: theme === 'light' ? '#fafafa' : '#333', color: theme === 'light' ? '#000' : '#fff' },
        selectStyle: { borderRadius: '8px', borderColor: '#c8102e', transition: 'all 0.3s ease' },
        tableStyle: { background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderRadius: '12px', padding: '10px' },
        cardStyle: { background: theme === 'light' ? '#f9f9f9' : '#2d2d2d', borderRadius: '8px', padding: '15px', marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
        textStyle: { color: theme === 'light' ? '#333' : '#e0e0e0', fontSize: '14px' },
    };

    const handleError = useCallback((error, defaultMessage) => {
        console.error('Error:', error);
        let message = defaultMessage;
        if (typeof error.response?.data === 'string') {
            message = error.response.data;
        } else if (typeof error.response?.data === 'object') {
            message = error.response.data.message || JSON.stringify(error.response.data);
        } else if (error.message) {
            message = error.message;
        }
        notification.error({
            message: 'Erreur',
            description: message,
            placement: 'topRight',
        });
        setErrorMessage(message);
    }, []);

    const loadFormulaires = useCallback(async (page = 0, size = 10) => {
        if (!currentUser?.authToken) {
            console.warn('No auth token available');
            handleError(new Error('Utilisateur non authentifié'), 'Échec du chargement des formulaires');
            return;
        }
        setLoading(true);
        try {
            let data;
            if (currentUser.role === 'ADMIN') {
                data = await fetchFormulaires(page, size, currentUser.authToken);
                setFormulaires(data?.content || data || []);
                setFilteredFormulaires(data?.content || data || []);
            } else if (currentUser.role === 'EVALUATEUR') {
                data = await fetchEVALUATEURFormulaires(currentUser.id, currentUser.authToken);
                setFormulaires(data || []);
                setFilteredFormulaires(data || []);
            }
        } catch (error) {
            handleError(error, 'Échec du chargement des formulaires');
            setFormulaires([]);
            setFilteredFormulaires([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.authToken, currentUser?.id, currentUser?.role, handleError]);

    useEffect(() => {
        console.log('Current User at render:', currentUser);
        if (currentUser?.authToken) {
            loadFormulaires();
        }
    }, [currentUser?.authToken, loadFormulaires]);

    const filterFormulaires = useCallback(() => {
        let filtered = formulaires;
        if (searchText) {
            filtered = filtered.filter(
                (f) => f.titre?.toLowerCase().includes(searchText.toLowerCase()) ||
                    f.niveau?.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter((f) => f.statut === (statusFilter === 'active'));
        }
        setFilteredFormulaires(filtered);
    }, [formulaires, searchText, statusFilter]);

    useEffect(() => {
        filterFormulaires();
    }, [searchText, statusFilter, formulaires, filterFormulaires]);

    const handleFormulaireSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formData = { ...values, id_createur: currentUser.id, statut: values.statut !== undefined ? values.statut : true };
            setLoading(true);
            if (selectedFormulaire) {
                await updateFormulaire(selectedFormulaire.id, formData, currentUser.authToken);
                notification.success({ message: 'Succès', description: 'Formulaire mis à jour avec succès', placement: 'topRight' });
            } else {
                await createFormulaire(formData, currentUser.authToken);
                notification.success({ message: 'Succès', description: 'Formulaire créé avec succès', placement: 'topRight' });
            }
            setFormulaireModalVisible(false);
            form.resetFields();
            loadFormulaires();
        } catch (error) {
            handleError(error, 'Opération échouée');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFormulaire = async (id) => {
        try {
            setLoading(true);
            await deleteFormulaire(id, currentUser.authToken);
            notification.success({ message: 'Succès', description: 'Formulaire supprimé avec succès', placement: 'topRight' });
            loadFormulaires();
        } catch (error) {
            handleError(error, 'Échec de la suppression du formulaire');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateEvaluationLink = async (formId) => {
        try {
            setLoading(true);
            const exp = expirationDate ? expirationDate.toISOString() : null;
            const data = await generateEvaluationLink(formId, currentUser.authToken, exp);
            const link = `${window.location.origin}/evaluation?token=${data.token}`;
            setGeneratedLink(link);
            notification.success({ message: 'Succès', description: 'Lien généré ! Copiez-le ou scannez le QR code.', placement: 'topRight' });
        } catch (error) {
            handleError(error, 'Échec de la génération du lien');
        } finally {
            setLoading(false);
        }
    };

    const loadEVALUATEURs = async () => {
        if (!currentUser?.authToken) {
            console.warn('No auth token available for fetching evaluators');
            notification.error({ message: 'Erreur', description: 'Utilisateur non authentifié', placement: 'topRight' });
            setErrorMessage('Utilisateur non authentifié');
            return;
        }
        setLoading(true);
        setEVALUATEURs([]);
        setErrorMessage(null);
        try {
            console.log('Fetching evaluators with token:', currentUser.authToken);
            const response = await axios.get('http://localhost:8081/api/evaluation/EVALUATEURs', {
                headers: { Authorization: `Bearer ${currentUser.authToken}` },
                timeout: 5000
            });
            console.log('Evaluators response:', response.data);
            setEVALUATEURs(response.data || []);
            if (response.data.length === 0) {
                notification.warning({ message: 'Avertissement', description: 'Aucun évaluateur trouvé dans la base de données', placement: 'topRight' });
                setErrorMessage('Aucun évaluateur trouvé dans la base de données');
            }
        } catch (error) {
            console.error('Error fetching evaluators:', error);
            if (error.code === 'ERR_NETWORK') {
                handleError(error, 'Erreur réseau : impossible de contacter le serveur. Vérifiez que le serveur est en cours d\'exécution sur http://localhost:8080.');
            } else if (error.response?.status === 401) {
                handleError(error, 'Erreur d\'authentification : token invalide ou expiré. Veuillez vous reconnecter.');
            } else {
                handleError(error, 'Échec du chargement des évaluateurs');
            }
            setEVALUATEURs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchJournal = async () => {
        try {
            const res = await axios.get("http://localhost:8081/api/evaluation/journal", {
                headers: { Authorization: `Bearer ${currentUser.authToken}` }
            });
            setJournalData(res.data);
            setJournalVisible(true);
        } catch (err) {
            message.error("Erreur lors du chargement du journal");
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`http://localhost:8081/api/evaluation/stats/${currentUser.id}`, {
                    headers: { Authorization: `Bearer ${currentUser.authToken}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Erreur chargement stats", err);
            }
        };
        fetchStats();
    }, [currentUser]);

    useEffect(() => {
        const fetchToken = async () => {
            if (!currentUser?.id) {
                console.warn('No user ID available for fetching evaluation token');
                setErrorMessage('Utilisateur non identifié');
                return;
            }
            try {
                const link = await fetchEvaluationLink(currentUser.id);
                const url = new URL(link);
                const token = url.searchParams.get('token');
                if (token) {
                    setEvaluationToken(token);
                    localStorage.setItem('evaluationToken', token);
                    console.log('Token récupéré et stocké:', token);
                } else {
                    console.warn('No token found in evaluation link');
                    setErrorMessage('Aucun token d\'évaluation trouvé');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du lien d’évaluation:', error);
                setErrorMessage('Échec de la récupération du token d\'évaluation');
            }
        };
        if (currentUser?.id) {
            fetchToken();
        }
    }, [currentUser]);

    const handleAssignLink = async () => {
        try {
            const values = await emailForm.validateFields();
            setLoading(true);
            const response = await axios.post(
                `http://localhost:8081/api/evaluation/send-link?formId=${selectedFormulaire.id}&EVALUATEURId=${values.EVALUATEURId}`,
                null,
                { headers: { Authorization: `Bearer ${currentUser.authToken}` } }
            );
            notification.success({ message: 'Succès', description: response.data, placement: 'topRight' });
            setEmailModalVisible(false);
            emailForm.resetFields();
            setEVALUATEURs([]);
            setErrorMessage(null);
        } catch (error) {
            handleError(error, 'Échec de l\'assignation du lien');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSubmissionModal = async (record) => {
        if (!currentUser?.authToken) {
            notification.error({ message: 'Erreur', description: 'Utilisateur non authentifié', placement: 'topRight' });
            return;
        }
        if (!record?.id) {
            notification.error({ message: 'Erreur', description: 'ID du formulaire manquant', placement: 'topRight' });
            return;
        }
        setSelectedFormulaire(record);
        setSubmissionData(record);
        setUserAnswers({});
        setLoading(true);
        try {
            const questions = await fetchQuestions(record.id, currentUser.authToken);
            setQuestionsForSubmission(questions || []);
            setSubmissionModalVisible(true);
        } catch (error) {
            handleError(error, 'Échec du chargement des questions pour la soumission');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEvaluation = async (values) => {
        try {
            setLoading(true);

            const userId = parseInt(localStorage.getItem("userId"), 10);
            if (!selectedFormulaire?.id || !evaluationToken || !userId) {
                throw new Error(
                    `Données manquantes pour la soumission: formId=${selectedFormulaire?.id}, userId=${userId}, token=${evaluationToken}`
                );
            }

            const answers = Object.keys(values).map((key) => ({
                questionId: parseInt(key.replace("question_", ""), 10),
                userId: userId,
                texte: values[key],
            }));

            console.log("📤 Payload envoyé:", {
                formId: selectedFormulaire.id,
                token: evaluationToken,
                userId,
                answers,
            });

            const response = await axios.post(
                `http://localhost:8081/api/evaluation/submit?formId=${selectedFormulaire.id}`,
                answers, // body متاعك تبعث فيه غير answers
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Evaluation-Token": evaluationToken,
                        "X-User-Id": userId,
                        Authorization: `Bearer ${currentUser.authToken}`,
                    },
                }
            );

            console.log("✅ Submission response:", response.data);

            notification.success({
                message: "Succès",
                description: "Évaluation soumise avec succès",
                placement: "topRight",
            });

            setSubmissionModalVisible(false);
            form.resetFields();
            setUserAnswers({});
            setSubmissionData(null);
        } catch (error) {
            console.error("❌ Submission error:", error);
            let errorMessage = "Erreur lors de la soumission de l'évaluation.";
            if (!evaluationToken) {
                errorMessage =
                    "Aucun token d'évaluation trouvé. Veuillez accéder au formulaire via un lien d'évaluation valide.";
            } else {
                errorMessage =
                    error?.response?.data || error.message || errorMessage;
            }
            handleError(error, errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const handleShowDetails = async (record) => {
        setSelectedFormulaire(record);
        setLoading(true);
        try {
            const questions = await fetchQuestions(record.id, currentUser.authToken);
            setFormDetails({
                ...record,
                questions: questions || [],
                creationDate: record.creationDate || 'Non spécifiée',
                creator: record.id_createur ? `Utilisateur ${record.id_createur}` : 'Inconnu',
            });
            setDetailsModalVisible(true);
        } catch (error) {
            handleError(error, 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async (record) => {
        setLoading(true);
        try {
            const questions = await fetchQuestions(record.id, currentUser.authToken);
            const doc = new jsPDF();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(18);
            doc.setTextColor(200, 16, 46);
            doc.setFont('helvetica', 'bold');
            doc.text("Formulaire d'Évaluation", 70, 20);
            doc.setLineWidth(0.5);
            doc.setDrawColor(200, 16, 46);
            doc.line(10, 35, 200, 35);
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('Détails du Formulaire', 10, 50);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.text(`Titre: ${record.titre}`, 10, 60);
            doc.text(`Niveau: ${record.niveau}`, 10, 70);
            doc.text(`Date de Création: ${new Date(record.creationDate).toLocaleDateString()}`, 10, 80);
            doc.text(`Créateur: Utilisateur ${record.id_createur || 'Inconnu'}`, 10, 90);
            doc.text(`Statut: ${record.statut ? 'Actif' : 'Inactif'}`, 10, 100);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(200, 16, 46);
            doc.text('Questions', 10, 120);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            let y = 130;
            questions.forEach((q, index) => {
                doc.setFillColor(theme === 'light' ? '#ffffff' : '#2d2d2d');
                doc.rect(10, y - 5, 190, 25, 'F');
                doc.setTextColor(200, 16, 46);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${q.libelle}`, 15, y);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                doc.text(`Barème: ${q.bareme}, Pondération: ${q.ponderation}`, 20, y + 10);
                y += 30;
                if (y > 260) {
                    doc.addPage();
                    y = 20;
                    doc.setFontSize(18);
                    doc.setTextColor(200, 16, 46);
                    doc.setFont('helvetica', 'bold');
                    doc.text("Formulaire d'Évaluation", 70, 20);
                    doc.setLineWidth(0.5);
                    doc.setDrawColor(200, 16, 46);
                    doc.line(10, 35, 200, 35);
                    y = 50;
                }
            });
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Généré le ${new Date().toLocaleDateString()}`, 10, 280);
            doc.text('Esprit - Système de Gestion des Formulaires', 140, 280);
            doc.save(`Formulaire_${record.titre}.pdf`);
            notification.success({ message: 'Succès', description: 'PDF exporté avec succès', placement: 'topRight' });
        } catch (error) {
            handleError(error, "Échec de l'exportation PDF");
        } finally {
            setLoading(false);
        }
    };

    const handleExportResponsesPDF = async () => {
        setLoading(true);
        try {
            const doc = new jsPDF();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(18);
            doc.setTextColor(200, 16, 46);
            doc.setFont('helvetica', 'bold');
            doc.text("Mes Réponses aux Formulaires", 50, 20);
            doc.setLineWidth(0.5);
            doc.setDrawColor(200, 16, 46);
            doc.line(10, 35, 200, 35);
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('Détails des Réponses', 10, 50);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            let y = 60;

            mesReponses.forEach((rep, index) => {
                doc.setFillColor(theme === 'light' ? '#f9f9f9' : '#2d2d2d');
                doc.rect(10, y - 5, 190, 40, 'F');
                doc.setTextColor(200, 16, 46);
                doc.setFont('helvetica', 'bold');
                doc.text(`Formulaire ${index + 1}: ${rep.titreFormulaire}`, 15, y);
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                y += 10;
                doc.text(`Note: ${rep.noteGlobal || 'Non noté'}`, 20, y);
                y += 10;
                if (rep.commentaire) {
                    doc.text(`Commentaire: ${rep.commentaire}`, 20, y);
                    y += 10;
                }
                y += 5;

                doc.setFont('helvetica', 'bold');
                doc.setTextColor(200, 16, 46);
                doc.text('Réponses:', 15, y);
                y += 10;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);

                rep.reponsesQuestions.forEach((q, qIndex) => {
                    doc.text(`${qIndex + 1}. ${q.questionLibelle}`, 20, y);
                    y += 7;
                    doc.setFont('helvetica', 'italic');
                    doc.text(`Réponse: ${q.valeur || 'Aucune réponse'}`, 25, y);
                    doc.setFont('helvetica', 'normal');
                    y += 10;
                    if (y > 260) {
                        doc.addPage();
                        y = 20;
                        doc.setFontSize(18);
                        doc.setTextColor(200, 16, 46);
                        doc.setFont('helvetica', 'bold');
                        doc.text("Mes Réponses aux Formulaires", 50, 20);
                        doc.setLineWidth(0.5);
                        doc.setDrawColor(200, 16, 46);
                        doc.line(10, 35, 200, 35);
                        y = 50;
                    }
                });

                y += 10;
                if (y > 260) {
                    doc.addPage();
                    y = 20;
                    doc.setFontSize(18);
                    doc.setTextColor(200, 16, 46);
                    doc.setFont('helvetica', 'bold');
                    doc.text("Mes Réponses aux Formulaires", 50, 20);
                    doc.setLineWidth(0.5);
                    doc.setDrawColor(200, 16, 46);
                    doc.line(10, 35, 200, 35);
                    y = 50;
                }
            });

            if (mesReponses.length === 0) {
                doc.setTextColor(0, 0, 0);
                doc.text('Aucune réponse disponible.', 10, 60);
            }

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Généré le ${new Date().toLocaleDateString()}`, 10, 280);
            doc.text('Esprit - Système de Gestion des Formulaires', 140, 280);
            doc.save('Mes_Reponses.pdf');
            notification.success({ message: 'Succès', description: 'PDF des réponses exporté avec succès', placement: 'topRight' });
        } catch (error) {
            handleError(error, "Échec de l'exportation des réponses en PDF");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const csvData = formulaires.map((f) => ({
            ID: f.id,
            Titre: f.titre,
            Niveau: f.niveau,
            Statut: f.statut ? 'Actif' : 'Inactif',
            'Date de Création': new Date(f.creationDate).toLocaleDateString(),
            Créateur: `Utilisateur ${f.id_createur || 'Inconnu'}`,
        }));
        return (
            <Tooltip title="Exporter en CSV">
                <CSVLink data={csvData} filename="formulaires.csv" style={styles.iconButtonStyle} aria-label="Exporter les formulaires en CSV">
                    <FileExcelOutlined style={{ fontSize: '20px' }} />
                </CSVLink>
            </Tooltip>
        );
    };

    const handleExportJournalCSV = () => {
        const csvData = filteredJournalData.flatMap((entry, idx) =>
            entry.questionsReponses.map((qr, qIdx) => ({
                ID: idx + 1,
                Titre_Formulaire: entry.titreFormulaire,
                Evaluateur: entry.nomEvaluateur,
                Date_Reponse: moment(entry.dateReponse).format('DD/MM/YYYY HH:mm'),
                Question: qr.question,
                Reponse: qr.reponse,
            }))
        );
        return (
            <Tooltip title="Exporter le journal en CSV">
                <CSVLink data={csvData} filename="journal_reponses.csv" style={styles.buttonStyle} aria-label="Exporter le journal en CSV">
                    <FileExcelOutlined style={{ marginRight: '8px' }} />
                    Exporter en CSV
                </CSVLink>
            </Tooltip>
        );
    };

    const handleVoirMesReponses = async () => {
        try {
            setLoading(true);

            // 🟢 نستعمل currentUser مباشرة
            const userId = currentUser.id;
            console.log("🔎 Chargement réponses de userId:", userId);

            const res = await axios.get(
                `http://localhost:8081/api/evaluation/mes-reponses-detail/${userId}`,
                {
                    headers: { Authorization: `Bearer ${currentUser.authToken}` },
                }
            );


            setMesReponses(Array.isArray(res.data) ? res.data : []);
            setMesReponsesModalVisible(true);
        } catch (error) {
            handleError(error, "Erreur lors du chargement des réponses");
            setMesReponses([]);
        } finally {
            setLoading(false);
        }
    };



    const handleSaveEdit = async () => {
        try {
            const payload = {
                commentaire: selectedReponse.commentaire || "",
                noteGlobal: selectedReponse.noteGlobal || null,
                reponsesQuestions: selectedReponse.reponsesQuestions.map(q => ({
                    idQuestion: q.idQuestion,
                    valeur: q.valeur
                }))
            };

            await axios.put(
                `http://localhost:8081/api/evaluation/mes-reponses/${selectedReponse.id}`,
                payload,
                { headers: { Authorization: `Bearer ${currentUser.authToken}` } }
            );

            message.success("Réponse mise à jour avec succès");
            setEditModalVisible(false);
            handleVoirMesReponses();
        } catch (err) {
            console.error(err);
            message.error("Erreur lors de la mise à jour");
        }
    };

    const handleDeleteReponse = async (id) => {
        try {
            await axios.delete(`http://localhost:8081/api/evaluation/mes-reponses/${id}`, {
                headers: { Authorization: `Bearer ${currentUser.authToken}` }
            });
            notification.success({ message: "Réponse supprimée avec succès" });
            handleVoirMesReponses();
        } catch (error) {
            handleError(error, "Erreur lors de la suppression de la réponse");
        }
    };

    const handleEditReponse = async (rep) => {
        try {
            const res = await axios.get(
                `http://localhost:8081/api/evaluation/mes-reponses-detail-by-id/${rep.id}`,
                { headers: { Authorization: `Bearer ${currentUser.authToken}` } }
            );
            setSelectedReponse(res.data);
            setEditModalVisible(true);
        } catch (err) {
            message.error("Erreur lors du chargement de la réponse");
        }
    };

    const handleDuplicateFormulaire = async (record) => {
        try {
            setLoading(true);
            const formData = { titre: `${record.titre} (Copie)`, niveau: record.niveau, description: record.description, statut: record.statut, id_createur: currentUser.id };
            await createFormulaire(formData, currentUser.authToken);
            notification.success({ message: 'Succès', description: 'Formulaire dupliqué avec succès', placement: 'topRight' });
            loadFormulaires();
        } catch (error) {
            handleError(error, 'Échec de la duplication du formulaire');
        } finally {
            setLoading(false);
        }
    };

    const handleShowStatistics = () => {
        const stats = {};
        formulaires.forEach((f) => {
            const niveau = f.niveau || 'Inconnu';
            if (!stats[niveau]) {
                stats[niveau] = 0;
            }
            stats[niveau]++;
        });
        const statsArray = Object.entries(stats).map(([niveau, count]) => ({ niveau, count }));
        setFormStatistics(statsArray);
        setStatisticsModalVisible(true);
    };

    const handleShowCompletionStats = async () => {
        setLoading(true);
        try {
            const userId = parseInt(localStorage.getItem("userId"), 10);
            const repRes = await axios.get(
                `http://localhost:8081/api/evaluation/mes-reponses-detail/${userId}`,
                { headers: { Authorization: `Bearer ${currentUser.authToken}` } }
            );
            const submitted = repRes.data || [];

            let questionsRepondues = 0;
            submitted.forEach(rep => {
                questionsRepondues += rep.reponsesQuestions.length;
            });

            let questionsEnCours = 0;
            const submittedIds = new Set(submitted.map(rep => rep.idFormulaire)); // Assurez-vous que 'idFormulaire' existe dans les données de réponse (modifiez le backend si nécessaire)

            for (const form of formulaires) {
                if (!submittedIds.has(form.id)) {
                    const questions = await fetchQuestions(form.id, currentUser.authToken);
                    questionsEnCours += questions.length;
                }
            }

            setQuestionStats({ questionsRepondues, questionsEnCours });
            setCompletionStatsModalVisible(true);
        } catch (error) {
            handleError(error, 'Échec du chargement des statistiques des questions');
            setQuestionStats({ questionsRepondues: 0, questionsEnCours: 0 });
        } finally {
            setLoading(false);
        }
    };

    const filteredJournalData = journalData.filter(entry => {
        const matchesSearch = journalSearch
            ? entry.titreFormulaire.toLowerCase().includes(journalSearch.toLowerCase()) ||
            entry.nomEvaluateur.toLowerCase().includes(journalSearch.toLowerCase())
            : true;
        const matchesDate = journalDateRange
            ? moment(entry.dateReponse).isBetween(journalDateRange[0], journalDateRange[1], null, '[]')
            : true;
        return matchesSearch && matchesDate;
    });

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: (a, b) => a.id - b.id },
        { title: 'Titre', dataIndex: 'titre', key: 'titre', sorter: (a, b) => a.titre.localeCompare(b.titre) },
        { title: 'Niveau', dataIndex: 'niveau', key: 'niveau', sorter: (a, b) => a.niveau.localeCompare(b.niveau) },
        { title: 'Statut', dataIndex: 'statut', key: 'statut', render: (statut) => <Tag color={statut ? '#FF8787' : '#c8102e'}>{statut ? 'Actif' : 'Inactif'}</Tag>, width: 120 },
        {
            title: 'Actions',
            key: 'actions',
            width: 350,
            render: (_, record) => (
                <Space>
                    {currentUser?.role === 'ADMIN' ? (
                        <>
                            <Button icon={<EditOutlined />} onClick={() => { setSelectedFormulaire(record); form.setFieldsValue(record); setFormulaireModalVisible(true); }} style={{ color: styles.secondaryColor }} />
                            <Popconfirm title="Êtes-vous sûr de supprimer ce formulaire ?" onConfirm={() => handleDeleteFormulaire(record.id)} okText="Oui" cancelText="Non">
                                <Button icon={<DeleteOutlined />} style={{ color: styles.secondaryColor }} />
                            </Popconfirm>
                            <Button icon={<QuestionOutlined />} onClick={() => { setSelectedFormulaire(record); setQuestionManagementModalVisible(true); }} style={{ color: styles.secondaryColor }}>Questions</Button>
                            <Button icon={<LinkOutlined />} onClick={() => { setSelectedFormulaire(record); setLinkModalVisible(true); handleGenerateEvaluationLink(record.id); }} style={{ color: styles.secondaryColor }} />
                            <Button icon={<MailOutlined />} onClick={() => { setSelectedFormulaire(record); setEmailModalVisible(true); loadEVALUATEURs(); }} style={{ color: styles.secondaryColor }} disabled={!currentUser?.authToken}>Assigner</Button>
                            <Button icon={<InfoCircleOutlined />} onClick={() => handleShowDetails(record)} style={{ color: styles.secondaryColor }} />
                            <Button icon={<FilePdfOutlined />} onClick={() => handleExportPDF(record)} style={{ color: styles.secondaryColor }} />
                            <Tooltip title="Dupliquer le formulaire">
                                <Button icon={<CopyTwoTone />} onClick={() => handleDuplicateFormulaire(record)} style={styles.iconButtonStyle} aria-label="Dupliquer le formulaire" />
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <Button type="primary" onClick={() => handleOpenSubmissionModal(record)} style={styles.buttonStyle} aria-label="Remplir le formulaire">Remplir</Button>
                            <Button icon={<InfoCircleOutlined />} onClick={() => handleShowDetails(record)} style={{ color: styles.secondaryColor }} />
                        </>
                    )}
                </Space>
            ),
        },
    ];

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'EVALUATEUR')) {
        return <Alert message="Accès non autorisé" description="Vous n'avez pas les permissions nécessaires pour voir cette section." type="error" showIcon style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e' }} />;
    }

    return (
        <div style={styles.containerStyle}>
            <Spin spinning={loading}>
                <Row justify="space-between" align="middle" style={{ marginBottom: '10px' }}>
                    {currentUser?.role === 'EVALUATEUR' && (
                        <Col>
                            <Tooltip title="Voir mes réponses">
                                <Button
                                    icon={<FilePdfOutlined />}
                                    onClick={() => handleVoirMesReponses()}
                                    style={styles.buttonStyle}
                                    aria-label="Voir mes réponses"
                                >
                                    Mes Réponses
                                </Button>
                            </Tooltip>
                        </Col>
                    )}
                    <Col>
                        {currentUser?.role === 'ADMIN' && handleExportCSV()}
                    </Col>
                    <Col>
                        {currentUser?.role === 'ADMIN' && (
                            <>
                                <Tooltip title="Voir les statistiques par niveau académique">
                                    <Button icon={<BarChartOutlined />} onClick={handleShowStatistics} style={styles.iconButtonStyle} aria-label="Voir les statistiques" />
                                </Tooltip>
                                <Tooltip title="Voir le journal">
                                    <Button
                                        type="primary"
                                        onClick={fetchJournal}
                                        style={styles.buttonStyle}
                                        aria-label="Voir le journal des réponses"
                                    >
                                        📜 Voir le journal
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                        {currentUser?.role === 'EVALUATEUR' && (
                            <Tooltip title="Voir les statistiques de remplissage">
                                <Button icon={<BarChartOutlined />} onClick={handleShowCompletionStats} style={styles.iconButtonStyle} aria-label="Voir les statistiques de remplissage" />
                            </Tooltip>
                        )}
                    </Col>
                </Row>
                {currentUser?.role === 'ADMIN' && (
                    <Row gutter={[8, 8]} style={{ marginBottom: '10px' }}>
                        <Col xs={24} sm={8}>
                            <Input placeholder="Rechercher par titre ou niveau" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={styles.inputStyle} size="large" />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Select value={statusFilter} onChange={setStatusFilter} style={{ ...styles.selectStyle, width: '100%' }} size="large">
                                <Option value="all">Tous les statuts</Option>
                                <Option value="active">Actif</Option>
                                <Option value="inactive">Inactif</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Tooltip title="Ajouter un nouveau formulaire">
                                <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => { setSelectedFormulaire(null); form.resetFields(); setFormulaireModalVisible(true); }} style={styles.buttonStyle} aria-label="Ajouter un nouveau formulaire" />
                            </Tooltip>
                        </Col>
                    </Row>
                )}
                {currentUser?.role === 'ADMIN' ? (
                    <Table columns={columns} dataSource={filteredFormulaires} loading={loading} rowKey="id" pagination={{ pageSizeOptions: ['10', '20', '50'], showSizeChanger: true, defaultPageSize: 10 }} style={styles.tableStyle} scroll={{ y: 400 }} />
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredFormulaires.map((formulaire) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={formulaire.id}>
                                <Card
                                    hoverable
                                    style={{
                                        ...styles.cardStyle,
                                        border: `1px solid ${styles.primaryColor}`,
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                    actions={[
                                        <Button
                                            type="primary"
                                            onClick={() => handleOpenSubmissionModal(formulaire)}
                                            style={styles.buttonStyle}
                                            aria-label="Remplir le formulaire"
                                        >
                                            Remplir
                                        </Button>,
                                        <Button
                                            icon={<InfoCircleOutlined />}
                                            onClick={() => handleShowDetails(formulaire)}
                                            style={{ color: styles.secondaryColor }}
                                        >
                                            Détails
                                        </Button>,
                                    ]}
                                >
                                    <Title level={4} style={{ color: styles.primaryColor, marginBottom: '8px' }}>
                                        {formulaire.titre}
                                    </Title>
                                    <Text style={styles.textStyle}>Niveau: {formulaire.niveau}</Text>
                                    <br />
                                    <Tag color={formulaire.statut ? '#FF8787' : '#c8102e'} style={{ marginTop: '8px' }}>
                                        {formulaire.statut ? 'Actif' : 'Inactif'}
                                    </Tag>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
                {currentUser?.role === 'ADMIN' && (
                    <Modal
                        title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>{selectedFormulaire ? `Questions pour "${selectedFormulaire.titre}"` : 'Gérer les Questions'}</span>}
                        open={questionManagementModalVisible}
                        onCancel={() => { setQuestionManagementModalVisible(false); setSelectedFormulaire(null); }}
                        footer={null}
                        width={600}
                        destroyOnClose
                        style={styles.modalStyle}
                    >
                        {selectedFormulaire ? (
                            <QuestionManagement formulaireId={selectedFormulaire.id} authToken={currentUser.authToken} selectedFormulaire={selectedFormulaire} onClose={() => { setQuestionManagementModalVisible(false); setSelectedFormulaire(null); loadFormulaires(); }} />
                        ) : (
                            <Alert message="Aucun formulaire sélectionné" type="warning" />
                        )}
                    </Modal>
                )}
                {currentUser?.role === 'ADMIN' && (
                    <Modal
                        title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>{selectedFormulaire ? 'Modifier Formulaire' : 'Créer Nouvel Formulaire'}</span>}
                        open={formulaireModalVisible}
                        onCancel={() => { setFormulaireModalVisible(false); form.resetFields(); }}
                        footer={null}
                        destroyOnClose
                        style={styles.modalStyle}
                    >
                        <Form form={form} layout="vertical" onFinish={handleFormulaireSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <Row gutter={[12, 12]}>
                                <Col span={12}>
                                    <Form.Item name="titre" label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Titre</Text>} rules={[{ required: true, message: 'Veuillez entrer le titre du formulaire!' }, { min: 5, message: 'Le titre doit contenir au moins 5 caractères!' }]}>
                                        <Input style={styles.inputStyle} placeholder="Entrez le titre" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="niveau" label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Niveau</Text>} rules={[{ required: true, message: 'Veuillez sélectionner le niveau du formulaire!' }]}>
                                        <Select style={styles.selectStyle} size="large" placeholder="Sélectionner un niveau">
                                            <Option value="L1">L1</Option>
                                            <Option value="L2">L2</Option>
                                            <Option value="L3">L3</Option>
                                            <Option value="Master">Master</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[12, 12]}>
                                <Col span={24}>
                                    <Form.Item name="description" label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Description</Text>} rules={[{ max: 500, message: 'La description ne peut pas dépasser 500 caractères!' }]}>
                                        <Input.TextArea style={styles.inputStyle} rows={3} placeholder="Entrez la description" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[12, 12]}>
                                <Col span={12}>
                                    <Form.Item name="statut" label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Statut (Actif/Inactif)</Text>} valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="maxSubmissions" label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Nombre max de soumissions</Text>}>
                                        <InputNumber min={1} style={{ ...styles.inputStyle, width: '100%' }} placeholder="Optionnel" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large" style={styles.buttonStyle} icon={<PlusCircleOutlined />} aria-label={selectedFormulaire ? 'Modifier le formulaire' : 'Créer un formulaire'}>
                                    {selectedFormulaire ? 'Modifier' : 'Créer'} Formulaire
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                )}
                <Modal
                    title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>Générer lien d'évaluation</span>}
                    open={linkModalVisible}
                    onCancel={() => { setLinkModalVisible(false); setGeneratedLink(''); setExpirationDate(null); }}
                    footer={[
                        <Button key="copy" icon={<CopyOutlined />} disabled={!generatedLink} onClick={() => { navigator.clipboard.writeText(generatedLink); notification.success({ message: 'Succès', description: 'Lien copié dans le presse-papier', placement: 'topRight' }); }} style={styles.buttonStyle}>Copier le lien</Button>,
                        <Button key="close" onClick={() => { setLinkModalVisible(false); setGeneratedLink(''); setExpirationDate(null); }} style={{ borderRadius: '8px', background: '#c8102e', borderColor: '#c8102e', color: '#ffffff' }}>Fermer</Button>,
                    ]}
                    destroyOnClose
                    style={styles.modalStyle}
                >
                    <Row gutter={[12, 12]} style={{ marginBottom: '10px' }}>
                        <Col span={24}>
                            <DatePicker showTime size="large" style={styles.inputStyle} placeholder="Choisissez la date d'expiration (optionnel)" onChange={(date) => setExpirationDate(date)} value={expirationDate} allowClear />
                        </Col>
                    </Row>
                    {generatedLink ? (
                        <>
                            <Alert message="Lien généré" description={<a href={generatedLink} target="_blank" rel="noopener noreferrer">{generatedLink}</a>} type="success" showIcon style={{ marginBottom: '10px', background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e' }} />
                            <div style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: styles.primaryColor }}>QR Code pour le lien d'évaluation</Text>
                                <div style={{ margin: '10px 0', display: 'flex', justifyContent: 'center' }}>
                                    <QRCodeCanvas value={generatedLink} size={180} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <Alert message="Le lien sera généré automatiquement avec la date d'expiration sélectionnée." type="info" showIcon style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e' }} />
                    )}
                </Modal>
                <Modal
                    title={<Title level={4} style={{ color: styles.primaryColor, margin: 0 }}>{selectedFormulaire ? `Remplir "${selectedFormulaire.titre}"` : 'Remplir Formulaire'}</Title>}
                    open={submissionModalVisible}
                    onCancel={() => { setSubmissionModalVisible(false); setUserAnswers({}); setSubmissionData(null); form.resetFields(); }}
                    onOk={() => form.submit()}
                    okText="Soumettre"
                    cancelText="Annuler"
                    width={700}
                    style={styles.modalStyle}
                    destroyOnClose
                    footer={[
                        <Button key="cancel" onClick={() => { setSubmissionModalVisible(false); setUserAnswers({}); setSubmissionData(null); form.resetFields(); }} style={{ borderRadius: '8px', borderColor: '#c8102e', color: '#c8102e' }}>
                            Annuler
                        </Button>,
                        <Button key="submit" type="primary" onClick={() => form.submit()} style={styles.buttonStyle} icon={<PlusCircleOutlined />}>
                            Soumettre
                        </Button>,
                    ]}
                >
                    <div style={{ padding: '15px', maxHeight: '60vh', overflowY: 'auto', background: theme === 'light' ? '#f9f9f9' : '#2d2d2d', borderRadius: '8px' }}>
                        {submissionData?.dateExpiration && (
                            <Alert
                                message={<Text strong style={{ color: styles.primaryColor }}>Date limite de soumission</Text>}
                                description={`Veuillez soumettre avant le ${moment(submissionData.dateExpiration).format("DD/MM/YYYY HH:mm")}`}
                                type="warning"
                                showIcon
                                style={{ ...styles.cardStyle, marginBottom: '15px', borderColor: '#c8102e' }}
                            />
                        )}
                        {questionsForSubmission.length === 0 ? (
                            <Alert
                                message="Aucune question disponible"
                                description="Ce formulaire ne contient aucune question à remplir."
                                type="info"
                                showIcon
                                style={{ ...styles.cardStyle, background: theme === 'light' ? '#f9f9f9' : '#2d2d2d' }}
                            />
                        ) : (
                            <>
                                <Progress
                                    percent={calculateProgress()}
                                    status="active"
                                    strokeColor={{ from: '#FF6B6B', to: '#FF8787' }}
                                    style={{ marginBottom: '20px' }}
                                    showInfo={true}
                                    format={(percent) => `${percent}% (${Object.entries(userAnswers).filter(([_, value]) => value && value.trim() !== '').length}/${questionsForSubmission.length})`}
                                />
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSubmitEvaluation}
                                    style={{ margin: 0 }}
                                >
                                    {questionsForSubmission.map((question, index) => (
                                        <div key={question.id} style={{ ...styles.cardStyle, marginBottom: '15px' }}>
                                            <Form.Item
                                                name={`question_${question.id}`}
                                                label={
                                                    <Text strong style={{ color: styles.primaryColor, fontSize: '16px' }}>
                                                        {`${index + 1}. ${question.libelle}`}
                                                    </Text>
                                                }
                                                rules={[{ required: true, message: 'Veuillez répondre à cette question.' }]}
                                            >
                                                <Input.TextArea
                                                    rows={4}
                                                    placeholder="Entrez votre réponse ici..."
                                                    value={userAnswers[question.id] || ""}
                                                    onChange={(e) => {
                                                        setUserAnswers({ ...userAnswers, [question.id]: e.target.value });
                                                    }}
                                                    style={{
                                                        ...styles.inputStyle,
                                                        marginTop: '8px',
                                                        padding: '10px',
                                                        borderColor: userAnswers[question.id] && userAnswers[question.id].trim() !== '' ? '#52c41a' : '#c8102e',
                                                    }}
                                                />
                                            </Form.Item>
                                        </div>
                                    ))}
                                </Form>
                            </>
                        )}
                    </div>
                </Modal>
                <Modal
                    title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>{formDetails ? `Détails du formulaire "${formDetails.titre}"` : 'Détails du formulaire'}</span>}
                    open={detailsModalVisible}
                    onCancel={() => setDetailsModalVisible(false)}
                    footer={[<Button key="close" onClick={() => setDetailsModalVisible(false)} style={{ borderRadius: '8px', background: '#c8102e', borderColor: '#c8102e', color: '#ffffff' }}>Fermer</Button>]}
                    width={600}
                    destroyOnClose
                    style={styles.modalStyle}
                >
                    {formDetails ? (
                        <div>
                            <Typography.Paragraph><Text strong style={{ color: styles.primaryColor }}>Titre :</Text> {formDetails.titre}</Typography.Paragraph>
                            <Typography.Paragraph><Text strong style={{ color: styles.primaryColor }}>Niveau :</Text> {formDetails.niveau}</Typography.Paragraph>
                            <Typography.Paragraph><Text strong style={{ color: styles.primaryColor }}>Description :</Text> {formDetails.description}</Typography.Paragraph>
                            <Typography.Paragraph><Text strong style={{ color: styles.primaryColor }}>Date de création :</Text> {new Date(formDetails.creationDate).toLocaleString()}</Typography.Paragraph>
                            <Typography.Paragraph><Text strong style={{ color: styles.primaryColor }}>Créateur :</Text> {formDetails.creator}</Typography.Paragraph>
                            <Typography.Paragraph><Text strong style={{ color: styles.primaryColor }}>Statut :</Text> {formDetails.statut ? 'Actif' : 'Inactif'}</Typography.Paragraph>
                            <Typography.Title level={4} style={{ color: styles.primaryColor }}>Questions</Typography.Title>
                            <ul>
                                {formDetails.questions.map((q) => (
                                    <li key={q.id}>{q.libelle} (Barème: {q.bareme}, Pondération: {q.ponderation})</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <Alert message="Aucun détail disponible" type="info" />
                    )}
                </Modal>
                <Modal
                    title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>Mes Réponses aux Formulaires</span>}
                    open={mesReponsesModalVisible}
                    onCancel={() => setMesReponsesModalVisible(false)}
                    footer={[
                        <Button
                            key="export"
                            icon={<FilePdfOutlined />}
                            onClick={handleExportResponsesPDF}
                            style={styles.buttonStyle}
                            aria-label="Exporter les réponses en PDF"
                        >
                            Exporter en PDF
                        </Button>,
                        <Button
                            key="close"
                            onClick={() => setMesReponsesModalVisible(false)}
                            style={{ borderRadius: '8px', background: '#c8102e', borderColor: '#c8102e', color: '#ffffff' }}
                        >
                            Fermer
                        </Button>
                    ]}
                    width={800}
                    destroyOnClose
                    style={styles.modalStyle}
                >
                    <div style={{ padding: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                        {mesReponses.length === 0 ? (
                            <Alert
                                message="Aucune réponse disponible"
                                description="Vous n'avez pas encore soumis de réponses. Remplissez un formulaire pour voir vos réponses ici."
                                type="info"
                                showIcon
                                style={{ ...styles.cardStyle, background: theme === 'light' ? '#f9f9f9' : '#2d2d2d' }}
                            />
                        ) : (
                            <Collapse accordion style={{ background: 'transparent', border: 'none' }}>
                                {mesReponses.map((rep, index) => (
                                    <Panel
                                        header={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography.Text strong style={{ color: styles.primaryColor, fontSize: '16px' }}>
                                                    {rep.titreFormulaire}
                                                </Typography.Text>
                                                <Tag color={rep.noteGlobal ? '#52c41a' : '#c8102e'}>{rep.noteGlobal || 'Non noté'}</Tag>
                                            </div>
                                        }
                                        key={rep.id}
                                        style={{ ...styles.cardStyle, marginBottom: '10px' }}
                                    >
                                        <div style={{ padding: '10px' }}>
                                            {rep.commentaire && (
                                                <Typography.Paragraph style={styles.textStyle}>
                                                    <Text strong style={{ color: styles.primaryColor }}>Commentaire :</Text> {rep.commentaire}
                                                </Typography.Paragraph>
                                            )}
                                            <Typography.Title level={5} style={{ color: styles.primaryColor, marginTop: '10px' }}>
                                                Réponses
                                            </Typography.Title>
                                            {rep.reponsesQuestions && rep.reponsesQuestions.map((q, idx) => (
                                                <div key={idx} style={{ marginBottom: '10px' }}>
                                                    <Typography.Text strong style={{ ...styles.textStyle, display: 'block' }}>
                                                        {idx + 1}. {q.questionLibelle}
                                                    </Typography.Text>
                                                    <Typography.Text style={{ ...styles.textStyle, color: theme === 'light' ? '#666' : '#b0b0b0' }}>
                                                        Réponse : {q.valeur || 'Aucune réponse'}
                                                    </Typography.Text>
                                                </div>
                                            ))}
                                            <Space style={{ marginTop: '10px' }}>
                                                <Tooltip title="Modifier cette réponse">
                                                    <Button
                                                        type="primary"
                                                        icon={<EditOutlined />}
                                                        onClick={() => handleEditReponse(rep)}
                                                        style={styles.buttonStyle}
                                                    >
                                                        Modifier
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="Supprimer cette réponse">
                                                    <Popconfirm
                                                        title="Êtes-vous sûr de supprimer cette réponse ?"
                                                        onConfirm={() => handleDeleteReponse(rep.id)}
                                                        okText="Oui"
                                                        cancelText="Non"
                                                    >
                                                        <Button
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            style={{ borderRadius: '8px', borderColor: '#c8102e', color: '#c8102e' }}
                                                        >
                                                            Supprimer
                                                        </Button>
                                                    </Popconfirm>
                                                </Tooltip>
                                            </Space>
                                        </div>
                                    </Panel>
                                ))}
                            </Collapse>
                        )}
                    </div>
                </Modal>
                <Modal
                    title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>{selectedReponse ? `Modifier mes réponses - ${selectedReponse.titreFormulaire}` : 'Modifier Réponses'}</span>}
                    open={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    onOk={handleSaveEdit}
                    okText="Enregistrer"
                    cancelText="Annuler"
                    style={styles.modalStyle}
                    width={600}
                >
                    {selectedReponse?.reponsesQuestions?.map((q, idx) => (
                        <div key={idx} style={{ marginBottom: '15px' }}>
                            <Typography.Text strong style={{ ...styles.textStyle, color: styles.primaryColor }}>
                                {q.questionLibelle}
                            </Typography.Text>
                            <Input.TextArea
                                rows={3}
                                value={q.valeur}
                                onChange={(e) => {
                                    const updated = [...selectedReponse.reponsesQuestions];
                                    updated[idx].valeur = e.target.value;
                                    setSelectedReponse({ ...selectedReponse, reponsesQuestions: updated });
                                }}
                                style={{ ...styles.inputStyle, marginTop: '5px' }}
                            />
                        </div>
                    ))}
                </Modal>
                <Modal
                    title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>Statistiques des Formulaires Créés par Niveau Académique</span>}
                    open={statisticsModalVisible}
                    onCancel={() => setStatisticsModalVisible(false)}
                    footer={null}
                    destroyOnClose
                    style={styles.modalStyle}
                >
                    <Bar data={formStatistics} xField="niveau" yField="count" height={200} />
                    {formStatistics.length === 0 && (
                        <Alert message="Aucun formulaire disponible pour les statistiques" type="info" showIcon />
                    )}
                </Modal>
                <Modal
                    title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>Statistiques de Remplissage des Formulaires</span>}
                    open={completionStatsModalVisible}
                    onCancel={() => setCompletionStatsModalVisible(false)}
                    footer={[<Button key="close" onClick={() => setCompletionStatsModalVisible(false)} style={{ borderRadius: '8px', background: '#c8102e', borderColor: '#c8102e', color: '#ffffff' }}>Fermer</Button>]}
                    destroyOnClose
                    style={styles.modalStyle}
                    width={600}
                >
                    <div style={{ padding: '20px', background: theme === 'light' ? '#f9f9f9' : '#2d2d2d', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Typography.Title level={4} style={{ color: styles.primaryColor, textAlign: 'center', marginBottom: '20px' }}>Vue d'Ensemble des Formulaires</Typography.Title>
                        <Row gutter={16} justify="center" style={{ marginBottom: '20px' }}>
                            <Col span={12} style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: '#52c41a', fontSize: '24px' }}>{stats.formulairesRemplis}</Text>
                                <Typography.Paragraph style={{ color: styles.primaryColor }}>Formulaires Remplis</Typography.Paragraph>
                            </Col>
                            <Col span={12} style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: '#c8102e', fontSize: '24px' }}>{stats.formulairesNonRemplis}</Text>
                                <Typography.Paragraph style={{ color: styles.primaryColor }}>Formulaires Non Remplis</Typography.Paragraph>
                            </Col>
                        </Row>
                        <Row justify="center" style={{ marginBottom: '20px' }}>
                            <Col span={24} style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: styles.primaryColor, fontSize: '18px' }}>Total Formulaires : {stats.formulairesRemplis + stats.formulairesNonRemplis}</Text>
                            </Col>
                        </Row>
                        <Pie
                            data={[
                                { type: 'Remplis', value: stats.formulairesRemplis },
                                { type: 'Non Remplis', value: stats.formulairesNonRemplis },
                            ]}
                            angleField="value"
                            colorField="type"
                            color={({ type }) => (type === 'Remplis' ? '#52c41a' : '#c8102e')}
                            radius={0.9}
                            label={{
                                position: 'inside',
                                offset: '-30%',
                                content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
                                style: { fontSize: 14, textAlign: 'center' },
                            }}
                            interactions={[{ type: 'element-active' }]}
                            height={250}
                        />
                        <Typography.Title level={4} style={{ color: styles.primaryColor, textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>Statistiques des Questions</Typography.Title>
                        <Row gutter={16} justify="center" style={{ marginBottom: '20px' }}>
                            <Col span={12} style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: '#52c41a', fontSize: '24px' }}>{questionStats.questionsRepondues}</Text>
                                <Typography.Paragraph style={{ color: styles.primaryColor }}>Questions Répondues</Typography.Paragraph>
                            </Col>
                            <Col span={12} style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: '#c8102e', fontSize: '24px' }}>{questionStats.questionsEnCours}</Text>
                                <Typography.Paragraph style={{ color: styles.primaryColor }}>Questions En Cours</Typography.Paragraph>
                            </Col>
                        </Row>
                        <Row justify="center" style={{ marginBottom: '20px' }}>
                            <Col span={24} style={{ textAlign: 'center' }}>
                                <Text strong style={{ color: styles.primaryColor, fontSize: '18px' }}>Total Questions : {questionStats.questionsRepondues + questionStats.questionsEnCours}</Text>
                            </Col>
                        </Row>
                        <Pie
                            data={[
                                { type: 'Répondues', value: questionStats.questionsRepondues },
                                { type: 'En Cours', value: questionStats.questionsEnCours },
                            ]}
                            angleField="value"
                            colorField="type"
                            color={({ type }) => (type === 'Répondues' ? '#52c41a' : '#c8102e')}
                            radius={0.9}
                            label={{
                                position: 'inside',
                                offset: '-30%',
                                content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
                                style: { fontSize: 14, textAlign: 'center' },
                            }}
                            interactions={[{ type: 'element-active' }]}
                            height={250}
                        />
                        {(stats.formulairesRemplis === 0 && stats.formulairesNonRemplis === 0 && questionStats.questionsRepondues === 0 && questionStats.questionsEnCours === 0) && (
                            <Alert message="Aucune donnée disponible pour les statistiques" type="info" showIcon style={{ marginTop: '20px' }} />
                        )}
                    </div>
                </Modal>
                {currentUser?.role === 'ADMIN' && (
                    <Modal
                        title={<span style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold' }}>Assigner le lien d'évaluation</span>}
                        open={emailModalVisible}
                        onCancel={() => { setEmailModalVisible(false); emailForm.resetFields(); setEVALUATEURs([]); setErrorMessage(null); }}
                        footer={null}
                        destroyOnClose
                        style={styles.modalStyle}
                    >
                        <Form form={emailForm} layout="vertical" onFinish={handleAssignLink} style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <Form.Item
                                name="EVALUATEURId"
                                label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Sélectionner un évaluateur</Text>}
                                rules={[{ required: true, message: 'Veuillez sélectionner un évaluateur !' }]}
                            >
                                <Select
                                    style={styles.selectStyle}
                                    placeholder="Choisir un évaluateur"
                                    size="large"
                                    notFoundContent={<Text>Aucun évaluateur disponible</Text>}
                                    loading={loading}
                                >
                                    {EVALUATEURs.map(EVALUATEUR => (
                                        <Option key={EVALUATEUR.id} value={EVALUATEUR.id}>
                                            {EVALUATEUR.nom} ({EVALUATEUR.email})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    style={styles.buttonStyle}
                                    icon={<MailOutlined />}
                                    aria-label="Assigner le lien"
                                    disabled={EVALUATEURs.length === 0 || loading}
                                >
                                    Assigner
                                </Button>
                            </Form.Item>
                        </Form>
                        {EVALUATEURs.length === 0 && !loading && !errorMessage && (
                            <Alert
                                message="Aucun évaluateur trouvé"
                                description="Vérifiez que des utilisateurs avec le rôle 'EVALUATEUR' existent dans la base de données."
                                type="warning"
                                showIcon
                                style={{ marginTop: '10px' }}
                            />
                        )}
                    </Modal>
                )}
                {currentUser?.role === 'ADMIN' && (
                    <Modal
                        title={<Title level={4} style={{ color: styles.primaryColor, margin: 0 }}>Journal des Réponses</Title>}
                        open={journalVisible}
                        onCancel={() => {
                            setJournalVisible(false);
                            setJournalSearch('');
                            setJournalDateRange(null);
                        }}
                        footer={[
                            handleExportJournalCSV(),
                            <Button
                                key="close"
                                onClick={() => {
                                    setJournalVisible(false);
                                    setJournalSearch('');
                                    setJournalDateRange(null);
                                }}
                                style={{ borderRadius: '8px', background: '#c8102e', borderColor: '#c8102e', color: '#ffffff' }}
                            >
                                Fermer
                            </Button>
                        ]}
                        width={1000}
                        destroyOnClose
                        style={styles.modalStyle}
                        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
                    >
                        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                            <Col xs={24} sm={12}>
                                <Input
                                    prefix={<SearchOutlined />}
                                    placeholder="Rechercher par titre ou évaluateur"
                                    value={journalSearch}
                                    onChange={(e) => setJournalSearch(e.target.value)}
                                    style={styles.inputStyle}
                                    size="large"
                                    allowClear
                                    aria-label="Rechercher dans le journal"
                                />
                            </Col>
                            <Col xs={24} sm={12}>
                                <RangePicker
                                    style={styles.inputStyle}
                                    size="large"
                                    onChange={(dates) => setJournalDateRange(dates)}
                                    value={journalDateRange}
                                    format="DD/MM/YYYY"
                                    allowClear
                                    aria-label="Filtrer par plage de dates"
                                />
                            </Col>
                        </Row>
                        {filteredJournalData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', background: theme === 'light' ? '#f9f9f9' : '#2d2d2d', borderRadius: '8px', ...styles.cardStyle }}>
                                <Title level={4} style={{ color: styles.primaryColor, marginBottom: '10px' }}>Aucune Réponse Trouvée</Title>
                                <Text style={{ ...styles.textStyle, display: 'block', marginBottom: '20px' }}>
                                    {journalSearch || journalDateRange
                                        ? 'Aucune réponse ne correspond à vos critères de recherche.'
                                        : 'Aucune réponse n’a été enregistrée dans le journal.'}
                                </Text>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        setJournalSearch('');
                                        setJournalDateRange(null);
                                    }}
                                    style={styles.buttonStyle}
                                    aria-label="Réinitialiser les filtres"
                                >
                                    Réinitialiser les Filtres
                                </Button>
                            </div>
                        ) : (
                            <Collapse
                                accordion
                                style={{ background: 'transparent', border: 'none' }}
                                expandIconPosition="right"
                            >
                                {filteredJournalData.reduce((acc, entry, idx) => {
                                    const panel = (
                                        <Panel
                                            header={
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text strong style={{ color: styles.primaryColor, fontSize: '16px' }}>
                                                        {entry.titreFormulaire} - {entry.nomEvaluateur} ({moment(entry.dateReponse).format('DD/MM/YYYY HH:mm')})
                                                    </Text>
                                                </div>
                                            }
                                            key={idx}
                                            style={{ ...styles.cardStyle, marginBottom: '10px' }}
                                        >
                                            <div style={{ padding: '10px' }}>
                                                <Descriptions column={1} bordered size="small" style={{ marginBottom: '15px', background: theme === 'light' ? '#fff' : '#333' }}>
                                                    <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Formulaire</Text>}>
                                                        {entry.titreFormulaire}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Évaluateur</Text>}>
                                                        {entry.nomEvaluateur}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Date</Text>}>
                                                        {moment(entry.dateReponse).format('DD/MM/YYYY HH:mm')}
                                                    </Descriptions.Item>
                                                </Descriptions>
                                                <Title level={5} style={{ color: styles.primaryColor, marginBottom: '10px' }}>
                                                    Réponses
                                                </Title>
                                                <ul style={{ paddingLeft: '20px', ...styles.textStyle }}>
                                                    {entry.questionsReponses.map((qr, i) => (
                                                        <li key={i} style={{ marginBottom: '10px' }}>
                                                            <Text strong style={{ color: styles.primaryColor }}>
                                                                {qr.question} :
                                                            </Text>{' '}
                                                            <Text style={{ color: theme === 'light' ? '#666' : '#b0b0b0' }}>
                                                                {qr.reponse || 'Aucune réponse'}
                                                            </Text>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Panel>
                                    );
                                    acc.push(panel);
                                    return acc;
                                }, [])}
                            </Collapse>
                        )}
                    </Modal>
                )}
            </Spin>
        </div>
    );
};

export default FormManagement;