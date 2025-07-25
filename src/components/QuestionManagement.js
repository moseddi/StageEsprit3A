// src/components/QuestionManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, InputNumber, Select, message, Space, Popconfirm, Button, Row, Col, Typography } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/apiService';

const { Option } = Select;
const { Text } = Typography;

const QuestionManagement = ({ currentUser, selectedFormulaire, onModalClose }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [form] = Form.useForm();

    // Callback stable pour charger les questions
    const loadQuestions = useCallback(async () => {
        if (!currentUser?.authToken || !selectedFormulaire?.id) return;
        setLoading(true);
        try {
            const data = await fetchQuestions(selectedFormulaire.id, currentUser.authToken);
            setQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            message.error('Échec du chargement des questions: ' + error.message);
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.authToken, selectedFormulaire?.id]);

    // Chargement des questions au montage et à chaque changement du formulaire sélectionné
    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const handleDeleteQuestion = async (id) => {
        try {
            await deleteQuestion(id, currentUser.authToken);
            message.success('Question supprimée avec succès');
            loadQuestions();
        } catch (error) {
            message.error('Échec de la suppression de la question: ' + error.message);
        }
    };

    const handleQuestionSubmit = async () => {
        try {
            const values = await form.validateFields();
            const questionData = { ...values, id_formulaire: selectedFormulaire.id };
            if (selectedQuestion) {
                await updateQuestion(selectedQuestion.id, questionData, currentUser.authToken);
                message.success('Question mise à jour avec succès');
            } else {
                await createQuestion(selectedFormulaire.id, questionData, currentUser.authToken);
                message.success('Question créée avec succès');
            }
            setModalVisible(false);
            loadQuestions();
        } catch (error) {
            message.error(error.message || 'Opération échouée');
        }
    };

    const columns = [
        { title: 'Libellé', dataIndex: 'libelle', key: 'libelle' },
        { title: 'Type', dataIndex: 'type', key: 'type' },
        { title: 'Barème', dataIndex: 'bareme', key: 'bareme' },
        { title: 'Pondération', dataIndex: 'ponderation', key: 'ponderation' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined className="text-red-500 cursor-pointer" onClick={() => {
                        setSelectedQuestion(record);
                        form.setFieldsValue(record);
                        setModalVisible(true);
                    }} />
                    <Popconfirm title="Êtes-vous sûr de supprimer cette question?" onConfirm={() => handleDeleteQuestion(record.id)} okText="Oui" cancelText="Non">
                        <DeleteOutlined className="text-red-500 cursor-pointer" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <h3 style={{ color: '#c8102e', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                Questions pour le formulaire : "{selectedFormulaire?.titre}"
            </h3>
            <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                    setSelectedQuestion(null);
                    form.resetFields();
                    setModalVisible(true);
                }}
                className="bg-red-500 hover:bg-red-600 mb-6 rounded-lg"
                size="large"
            >
                Ajouter Question
            </Button>
            <Table
                columns={columns}
                dataSource={questions}
                loading={loading}
                rowKey="id"
                className="ant-table-striped"
                pagination={false}
                style={{ background: '#fff0f5', borderRadius: '12px', padding: '10px' }}
            />
            <Modal
                title={<span style={{ color: '#ff69b4', fontSize: '20px', fontWeight: 'bold' }}>{selectedQuestion ? 'Modifier Question' : 'Créer Nouvelle Question'}</span>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                destroyOnClose
                style={{ borderRadius: '12px', background: '#fff0f5', padding: '20px', boxShadow: '0 4px 12px rgba(255, 105, 180, 0.2)' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleQuestionSubmit}
                    style={{ maxWidth: '600px', margin: '0 auto' }}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item
                                name="libelle"
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Libellé de la question</Text>}
                                rules={[{ required: true, message: 'Veuillez entrer le libellé!' }]}
                            >
                                <Input.TextArea
                                    style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                                    rows={2}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Type de question</Text>}
                                rules={[{ required: true, message: 'Veuillez sélectionner le type!' }]}
                            >
                                <Select
                                    style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                                    size="large"
                                    placeholder="Sélectionner un type"
                                >
                                    <Option value="TEXT">Texte</Option>
                                    <Option value="NUMERIC">Numérique</Option>
                                    <Option value="CHOICE">Choix multiple</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="bareme"
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Barème</Text>}
                                rules={[
                                    { required: true, message: 'Veuillez entrer le barème!' },
                                    { type: 'number', min: 0, message: 'Le barème doit être positif!' },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%', borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ponderation"
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Pondération (%)</Text>}
                                rules={[
                                    { required: true, message: 'Veuillez entrer la pondération!' },
                                    { type: 'number', min: 0, max: 100, message: 'La pondération doit être entre 0 et 100!' },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%', borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button
                            style={{
                                background: '#ff69b4',
                                color: '#fff',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                padding: '8px 20px',
                                fontSize: '16px',
                                fontWeight: '500',
                            }}
                            type="primary"
                            htmlType="submit"
                            size="large"
                            icon={<PlusCircleOutlined />}
                            onMouseEnter={(e) => { e.target.style.background = '#c8102e'; }}
                            onMouseLeave={(e) => { e.target.style.background = '#ff69b4'; }}
                        >
                            {selectedQuestion ? 'Modifier' : 'Ajouter'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuestionManagement;