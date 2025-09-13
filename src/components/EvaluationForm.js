/*import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Spin, notification, Typography, Alert } from 'antd';
import { fetchQuestions, submitEvaluation } from '../services/apiService';

const { Text } = Typography;

const EvaluationForm = () => {
    const [searchParams] = useSearchParams();
    const [form] = Form.useForm();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formulaire, setFormulaire] = useState(null);
    const [error, setError] = useState(null);

    const token = searchParams.get('token');

    // Charger les questions et les détails du formulaire
    useEffect(() => {
        const loadFormulaireAndQuestions = async () => {
            if (!token) {
                setError('Aucun token fourni');
                return;
            }
            setLoading(true);
            try {
                // Récupérer le formulaire via le token
                const response = await fetch(`/api/evaluation/formulaire?token=${token}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) {
                    throw new Error('Lien invalide ou expiré');
                }
                const data = await response.json();
                setFormulaire(data.formulaire);

                // Récupérer les questions
                const questionsData = await fetchQuestions(data.formulaire.id);
                setQuestions(questionsData || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadFormulaireAndQuestions();
    }, [token]);

    // Soumettre les réponses
    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const answers = Object.keys(values).map((key) => ({
                questionId: parseInt(key.replace('question_', '')),
                reponseText: values[key],
            }));
            await submitEvaluation(formulaire.id, answers, token);
            notification.success({
                message: 'Succès',
                description: 'Évaluation soumise avec succès',
                placement: 'topRight',
            });
            form.resetFields();
        } catch (error) {
            notification.error({
                message: 'Erreur',
                description: error.message || 'Échec de la soumission de l\'évaluation',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <Alert message="Erreur" description={error} type="error" showIcon />;
    }

    if (!formulaire) {
        return <Spin spinning={loading}>Chargement du formulaire...</Spin>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Typography.Title level={2}>{formulaire.titre}</Typography.Title>
            <Typography.Paragraph>{formulaire.description}</Typography.Paragraph>
            <Spin spinning={loading}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    {questions.map((q) => (
                        <Form.Item
                            key={q.id}
                            name={`question_${q.id}`}
                            label={<Text strong>{q.libelle}</Text>}
                            rules={[{ required: true, message: 'Veuillez répondre à cette question.' }]}
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder="Votre réponse ici..."
                                style={{ borderRadius: '8px', borderColor: '#c8102e' }}
                            />
                        </Form.Item>
                    ))}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={{
                                background: '#c8102e',
                                color: '#ffffff',
                                borderRadius: '8px',
                            }}
                        >
                            Soumettre l'évaluation
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </div>
    );
};

export default EvaluationForm;*/
import React, { useState, useEffect } from 'react';
import { Button, Input, message, Form, Spin, Typography } from 'antd';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

const EvaluationForm = ({ currentUser, theme }) => {
    const [formulaire, setFormulaire] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');

    const styles = {
        primaryColor: '#c8102e',
        secondaryColor: '#991b1b',
        containerStyle: {
            padding: '20px',
            borderRadius: '12px',
            background: theme === 'light' ? '#ffffff' : '#1f1f1f',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
        },
        buttonStyle: {
            background: '#c8102e',
            color: '#ffffff',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            padding: '6px 12px',
            fontSize: '16px',
            border: 'none',
        },
        inputStyle: {
            borderRadius: '8px',
            borderColor: '#c8102e',
            transition: 'all 0.3s ease',
        },
        modalStyle: {
            borderRadius: '12px',
            background: theme === 'light' ? '#ffffff' : '#2d2d2d',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
    };

    useEffect(() => {
        const fetchFormulaire = async () => {
            if (!token || !currentUser?.id) {
                message.error('Token ou utilisateur manquant');
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/api/evaluation/formulaire?token=${token}`, {
                    headers: { 'X-User-Id': currentUser.id },
                });
                setFormulaire(response.data);

                const questionsResponse = await axios.get(`http://localhost:8080/api/questions?formId=${response.data.id}`, {
                    headers: { 'Authorization': `Bearer ${currentUser.authToken}` },
                });
                setQuestions(questionsResponse.data);
            } catch (error) {
                message.error(error.response?.data || 'Erreur lors du chargement du formulaire');
            } finally {
                setLoading(false);
            }
        };
        fetchFormulaire();
    }, [token, currentUser?.id, currentUser?.authToken]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const answers = Object.keys(values).map((key) => ({
                questionId: parseInt(key.replace('question_', '')),
                reponseText: values[key],
            }));
            await axios.post(
                `http://localhost:8080/api/evaluation/submit?formId=${formulaire.id}`,
                answers,
                {
                    headers: {
                        'X-Evaluation-Token': token,
                        'X-User-Id': currentUser.id,
                        'Authorization': `Bearer ${currentUser.authToken}`,
                    },
                }
            );
            message.success('Évaluation soumise avec succès');
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data || 'Erreur lors de la soumission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.containerStyle}>
            <Spin spinning={loading}>
                {formulaire ? (
                    <>
                        <Title level={3} style={{ color: styles.primaryColor }}>
                            {formulaire.titre}
                        </Title>
                        <Text style={{ display: 'block', marginBottom: '20px' }}>
                            {formulaire.description || 'Aucune description disponible'}
                        </Text>
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            {questions.map((question) => (
                                <Form.Item
                                    key={question.id}
                                    name={`question_${question.id}`}
                                    label={<Text strong style={{ color: styles.primaryColor }}>{question.libelle}</Text>}
                                    rules={[{ required: true, message: 'Veuillez répondre à cette question.' }]}
                                >
                                    <Input.TextArea
                                        rows={4}
                                        placeholder="Votre réponse ici..."
                                        style={styles.inputStyle}
                                    />
                                </Form.Item>
                            ))}
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={styles.buttonStyle}
                                    disabled={questions.length === 0}
                                >
                                    Soumettre l'évaluation
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                ) : (
                    <Text>Aucun formulaire disponible</Text>
                )}
            </Spin>
        </div>
    );
};

export default EvaluationForm;