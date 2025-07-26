import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, Button, Space, Badge, NotificationOutlined, Typography, Alert, message } from 'antd';
import { fetchEvaluatorFormulaires, fetchQuestions, submitEvaluation } from '../services/apiService';
import { FileTextOutlined } from '@ant-design/icons';
import './EvaluatorInterface.css';

const { Text } = Typography;

const EvaluatorInterface = ({ currentUser }) => {
    const [formulaires, setFormulaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
    const [selectedFormulaire, setSelectedFormulaire] = useState(null);
    const [questionsForSubmission, setQuestionsForSubmission] = useState([]);
    const [form] = Form.useForm();
    const [notificationVisible, setNotificationVisible] = useState(false);

    const loadFormulaires = useCallback(async () => {
        if (!currentUser?.authToken || currentUser.role !== 'EVALUATOR') return;

        setLoading(true);
        try {
            const data = await fetchEvaluatorFormulaires(currentUser.id, currentUser.authToken);
            setFormulaires(data || []);
        } catch (error) {
            message.error('Échec du chargement des formulaires: ' + error.message);
            setFormulaires([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.authToken, currentUser?.id]);

    useEffect(() => {
        loadFormulaires();
    }, [loadFormulaires]);

    const handleOpenSubmissionModal = async (record) => {
        setSelectedFormulaire(record);
        setLoading(true);
        try {
            const questions = await fetchQuestions(record.id, currentUser.authToken);
            setQuestionsForSubmission(questions || []);
            setSubmissionModalVisible(true);
        } catch (error) {
            message.error('Échec du chargement des questions: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEvaluation = async (values) => {
        try {
            const answers = Object.keys(values).map(key => ({
                questionId: parseInt(key.replace('question_', '')),
                reponseText: values[key]
            }));

            await submitEvaluation(selectedFormulaire.id, answers, currentUser.authToken);
            message.success('Évaluation soumise avec succès');
            setSubmissionModalVisible(false);
            loadFormulaires();
        } catch (error) {
            message.error('Échec de la soumission: ' + error.message);
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Titre', dataIndex: 'titre', key: 'titre' },
        { title: 'Niveau', dataIndex: 'niveau', key: 'niveau' },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: statut => (
                <Badge status={statut ? 'success' : 'error'} text={statut ? 'Actif' : 'Inactif'} />
            ),
            width: 120,
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={() => handleOpenSubmissionModal(record)}
                    className="action-button"
                >
                    Remplir
                </Button>
            ),
        },
    ];

    return (
        <div className="evaluator-interface-container">
            <Badge count={formulaires.length} showZero>
                <Button
                    icon={<NotificationOutlined />}
                    onClick={() => setNotificationVisible(true)}
                    className="notification-button"
                    size="large"
                >
                    Notifications
                </Button>
            </Badge>

            <Modal
                title={<span className="modal-title">Formulaires Assignés</span>}
                open={notificationVisible}
                onCancel={() => setNotificationVisible(false)}
                footer={null}
                width={800}
                className="notification-modal"
            >
                <Table
                    columns={columns}
                    dataSource={formulaires}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    className="form-table"
                />
            </Modal>

            <Modal
                title={<span className="modal-title">{selectedFormulaire ? `Remplir "${selectedFormulaire.titre}"` : 'Remplir Formulaire'}</span>}
                open={submissionModalVisible}
                onCancel={() => setSubmissionModalVisible(false)}
                footer={null}
                destroyOnClose
                className="submission-modal"
            >
                {selectedFormulaire && questionsForSubmission.length > 0 ? (
                    <Form form={form} onFinish={handleSubmitEvaluation} layout="vertical">
                        {questionsForSubmission.map((q, index) => (
                            <Form.Item
                                key={q.id}
                                label={<Text className="question-label">{`${index + 1}. ${q.libelle} (Barème: ${q.bareme}, Pondération: ${q.ponderation})`}</Text>}
                                name={`question_${q.id}`}
                                rules={[{ required: true, message: 'Veuillez entrer une réponse!' }]}
                            >
                                <Input.TextArea
                                    rows={3}
                                    className="question-textarea"
                                />
                            </Form.Item>
                        ))}
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                className="submit-button"
                            >
                                Soumettre l'évaluation
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Alert message="Aucune question disponible pour ce formulaire." type="info" showIcon />
                )}
            </Modal>
        </div>
    );
};

export default EvaluatorInterface;