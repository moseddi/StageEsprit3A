import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Modal,
    Form,
    Input,
    Button,
    Badge,
    Typography,
    Alert,
    message,
    Card,
    Radio,
    InputNumber,
    Space,
    Tooltip
} from 'antd';
import {
    FileTextOutlined,
    NotificationOutlined,
    InfoCircleOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { fetchEvaluatorFormulaires, fetchQuestions, submitEvaluation } from '../services/apiService';
import './EvaluatorInterface.css'; // Don't forget to create this CSS file

const { Text, Title } = Typography;

// --- Sub-component for rendering each question ---
const QuestionItem = ({ question, formInstance }) => {
    const { id, libelle, type, options, bareme, ponderation } = question;
    const formName = `question_${id}`;

    // Define the component based on question type
    let questionComponent;
    switch (type) {
        case 'radio':
            questionComponent = (
                <Radio.Group>
                    {options.map(option => (
                        <Radio value={option.value} key={option.value}>{option.label}</Radio>
                    ))}
                </Radio.Group>
            );
            break;
        case 'number':
            questionComponent = (
                <InputNumber min={0} max={bareme} placeholder={`Note sur ${bareme}`} style={{ width: '100%' }} />
            );
            break;
        case 'text':
        default:
            questionComponent = <Input.TextArea rows={4} placeholder="Votre commentaire..." />;
            break;
    }

    return (
        <Card
            title={
                <Space>
                    <Text strong>{libelle}</Text>
                    <Tooltip title={`Barème: ${bareme}, Pondération: ${ponderation}`}>
                        <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                    </Tooltip>
                </Space>
            }
            style={{ marginBottom: 16, border: '1px solid #e8e8e8' }}
        >
            <Form.Item
                name={formName}
                rules={[{ required: true, message: 'Veuillez remplir ce champ !' }]}
                noStyle
            >
                {questionComponent}
            </Form.Item>
        </Card>
    );
};

// --- Main Evaluator Interface Component ---
const EvaluatorInterface = ({ currentUser }) => {
    const [formulaires, setFormulaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
    const [selectedFormulaire, setSelectedFormulaire] = useState(null);
    const [questionsForSubmission, setQuestionsForSubmission] = useState([]);
    const [form] = Form.useForm();
    const [notificationVisible, setNotificationVisible] = useState(false);

    // --- Data loading logic ---
    const loadFormulaires = useCallback(async () => {
        if (!currentUser?.authToken || currentUser.role !== 'EVALUATOR') return;
        setLoading(true);
        try {
            const data = await fetchEvaluatorFormulaires(currentUser.id, currentUser.authToken);
            setFormulaires(data || []);
        } catch (error) {
            message.error('Échec du chargement des formulaires.');
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
            // Simulate adding different question types for demonstration
            const simulatedQuestions = questions.map(q => ({
                ...q,
                type: Math.random() > 0.6 ? 'radio' : Math.random() > 0.5 ? 'number' : 'text',
                options: q.type === 'radio' ? [{ value: 'good', label: 'Bien' }, { value: 'average', label: 'Moyen' }, { value: 'bad', label: 'Mauvais' }] : undefined,
            }));
            setQuestionsForSubmission(simulatedQuestions || []);
            setSubmissionModalVisible(true);
        } catch (error) {
            message.error('Échec du chargement des questions.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEvaluation = async (values) => {
        try {
            const answers = Object.keys(values).map(key => ({
                questionId: parseInt(key.replace('question_', '')),
                reponse: values[key]
            }));

            await submitEvaluation(selectedFormulaire.id, answers, currentUser.authToken);
            message.success('Évaluation soumise avec succès !');
            setSubmissionModalVisible(false);
            form.resetFields(); // Reset the form fields
            loadFormulaires();
        } catch (error) {
            message.error('Échec de la soumission de l\'évaluation.');
        }
    };

    // --- Table columns definition ---
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Titre', dataIndex: 'titre', key: 'titre' },
        { title: 'Niveau', dataIndex: 'niveau', key: 'niveau' },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: statut => <Badge status={statut ? 'success' : 'error'} text={statut ? 'Actif' : 'Inactif'} />,
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
                >
                    Remplir
                </Button>
            ),
        },
    ];

    // --- Component JSX rendering ---
    return (
        <div className="evaluator-interface-container">
            <Title level={2}>Interface Évaluateur</Title>
            <Alert
                message="Bienvenue sur votre interface d'évaluation."
                description="Cliquez sur l'icône de notification pour voir les formulaires qui vous sont assignés."
                type="info"
                showIcon
                closable
                style={{ marginBottom: 24 }}
            />

            <div className="notification-area">
                <Badge count={formulaires.length} showZero>
                    <Button
                        icon={<NotificationOutlined />}
                        onClick={() => setNotificationVisible(true)}
                        size="large"
                        type="default"
                    >
                        Formulaires à évaluer
                    </Button>
                </Badge>
            </div>

            {/* Notification Modal */}
            <Modal
                title="Formulaires Assignés"
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
                    pagination={{ pageSize: 5 }}
                />
            </Modal>

            {/* Submission Modal */}
            <Modal
                title={<Title level={4}>Remplir: "{selectedFormulaire?.titre}"</Title>}
                open={submissionModalVisible}
                onCancel={() => {
                    setSubmissionModalVisible(false);
                    form.resetFields(); // Reset form on cancel
                }}
                footer={null}
                width={800}
                className="submission-modal"
            >
                {questionsForSubmission.length > 0 ? (
                    <Form form={form} onFinish={handleSubmitEvaluation} layout="vertical">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {questionsForSubmission.map(q => (
                                <QuestionItem key={q.id} question={q} formInstance={form} />
                            ))}
                        </Space>
                        <Form.Item style={{ marginTop: 24 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                icon={<SaveOutlined />}
                                style={{ width: '100%' }}
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