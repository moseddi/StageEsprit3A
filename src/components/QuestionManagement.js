
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, InputNumber, Switch, Space, Popconfirm, Button, Row, Col, Typography, Spin, notification } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/apiService';

const { Text } = Typography;

const QuestionManagement = ({ formulaireId, authToken, selectedFormulaire, onClose, theme }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [form] = Form.useForm();

  // Styles réutilisables
  const styles = {
    primaryColor: '#c8102e', // Rouge principal
    secondaryColor: '#991b1b', // Rouge sombre pour survol
    containerStyle: {
      padding: '20px',
      borderRadius: '12px',
      background: theme === 'light' ? '#ffffff' : '#1f1f1f',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
    modalStyle: {
      borderRadius: '12px',
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    buttonStyle: {
      background: '#c8102e',
      color: '#ffffff',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      padding: '8px 20px',
      fontSize: '16px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonStyle: {
      background: '#c8102e',
      color: '#ffffff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease, background 0.3s ease',
      border: 'none',
      ':hover': {
        transform: 'scale(1.1)',
        background: '#991b1b',
      },
    },
    inputStyle: {
      borderRadius: '8px',
      borderColor: '#c8102e',
      transition: 'all 0.3s ease',
    },
    tableStyle: {
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      borderRadius: '12px',
      padding: '10px',
    },
  };

  // Charger les questions
  const loadQuestions = useCallback(async () => {
    if (!authToken || !formulaireId) return;
    setLoading(true);
    try {
      const data = await fetchQuestions(formulaireId, authToken);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: error.message || 'Échec du chargement des questions',
        placement: 'topRight',
      });
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [formulaireId, authToken]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Gestion de la suppression d'une question
  const handleDeleteQuestion = async (id) => {
    setLoading(true);
    try {
      await deleteQuestion(id, authToken);
      notification.success({
        message: 'Succès',
        description: 'Question supprimée avec succès',
        placement: 'topRight',
      });
      loadQuestions();
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: error.message || 'Échec de la suppression de la question',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la soumission du formulaire
  const handleQuestionSubmit = async () => {
    try {
      const values = await form.validateFields();
      const questionData = {
        ...values,
        id_formulaire: formulaireId,
        statut: values.statut !== undefined ? values.statut : true,
      };
      setLoading(true);
      if (selectedQuestion) {
        await updateQuestion(selectedQuestion.id, questionData, authToken);
        notification.success({
          message: 'Succès',
          description: 'Question mise à jour avec succès',
          placement: 'topRight',
        });
      } else {
        await createQuestion(formulaireId, questionData, authToken);
        notification.success({
          message: 'Succès',
          description: 'Question créée avec succès',
          placement: 'topRight',
        });
      }
      setModalVisible(false);
      form.resetFields();
      loadQuestions();
      onClose();
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: error.message || 'Échec de l\'opération',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'ouverture du modal
  const handleOpenModal = (question = null) => {
    setSelectedQuestion(question);
    if (question) {
      form.setFieldsValue({
        libelle: question.libelle,
        bareme: question.bareme,
        ponderation: question.ponderation,
        statut: question.statut,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      sorter: (a, b) => a.libelle.localeCompare(b.libelle),
    },
    {
      title: 'Barème',
      dataIndex: 'bareme',
      key: 'bareme',
      sorter: (a, b) => a.bareme - b.bareme,
    },
    {
      title: 'Pondération',
      dataIndex: 'ponderation',
      key: 'ponderation',
      render: (value) => `${value}%`,
      sorter: (a, b) => a.ponderation - b.ponderation,
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => (
        <span style={{ color: statut ? '#389e0d' : '#c8102e' }}>
          {statut ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            style={{ color: styles.secondaryColor }}
            onClick={() => handleOpenModal(record)}
            aria-label="Modifier la question"
          />
          <Popconfirm
            title="Êtes-vous sûr de supprimer cette question ?"
            onConfirm={() => handleDeleteQuestion(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              icon={<DeleteOutlined />}
              style={{ color: styles.secondaryColor }}
              aria-label="Supprimer la question"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Vérification des props pour le rendu conditionnel
  if (!authToken || !formulaireId) {
    return (
      <div style={styles.containerStyle}>
        <Text type="danger">Erreur : Utilisateur non authentifié ou formulaire non sélectionné.</Text>
      </div>
    );
  }

  return (
    <div style={styles.containerStyle}>
      <Spin spinning={loading}>
        <h3 style={{ color: styles.primaryColor, fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          Questions pour le formulaire : {selectedFormulaire ? selectedFormulaire.titre : 'Chargement...'}
        </h3>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => handleOpenModal()}
          style={{ ...styles.buttonStyle, marginBottom: '24px' }}
          size="large"
          loading={loading}
          aria-label="Ajouter une question"
        >
          Ajouter Question
        </Button>
        <Table
          columns={columns}
          dataSource={questions}
          loading={loading}
          rowKey="id"
          pagination={false}
          style={styles.tableStyle}
        />
        <Modal
          title={
            <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
              {selectedQuestion ? 'Modifier Question' : 'Créer Nouvelle Question'}
            </span>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            onClose();
          }}
          footer={null}
          destroyOnClose
          style={styles.modalStyle}
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
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Libellé de la question</Text>}
                  rules={[{ required: true, message: 'Veuillez entrer le libellé !' }]}
                >
                  <Input.TextArea
                    style={styles.inputStyle}
                    rows={2}
                    placeholder="Entrez le libellé de la question"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="bareme"
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Barème</Text>}
                  rules={[
                    { required: true, message: 'Veuillez entrer le barème !' },
                    { type: 'number', min: 0, message: 'Le barème doit être positif !' },
                  ]}
                >
                  <InputNumber
                    style={{ ...styles.inputStyle, width: '100%' }}
                    placeholder="Entrez le barème"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ponderation"
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Pondération (%)</Text>}
                  rules={[
                    { required: true, message: 'Veuillez entrer la pondération !' },
                    { type: 'number', min: 0, max: 100, message: 'La pondération doit être entre 0 et 100 !' },
                  ]}
                >
                  <InputNumber
                    style={{ ...styles.inputStyle, width: '100%' }}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace('%', '')}
                    placeholder="Entrez la pondération"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="statut"
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Statut (Actif/Inactif)</Text>}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={styles.buttonStyle}
                icon={<PlusCircleOutlined />}
                loading={loading}
                aria-label={selectedQuestion ? 'Modifier la question' : 'Ajouter une question'}
              >
                {selectedQuestion ? 'Modifier' : 'Ajouter'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default QuestionManagement;
