
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Button,
  Alert,
  Row,
  Col,
  Typography,
  Spin,
  notification,
  Tooltip,
  Tag,
  Switch,
} from 'antd';
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  CopyTwoTone,
} from '@ant-design/icons';
import { fetchClasses, createClass, updateClass, deleteClass } from '../services/apiService';

const { Text } = Typography;

const ClassManagement = ({ currentUser, theme }) => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [form] = Form.useForm();
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      padding: '6px 12px',
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
      padding: '16px',
    },
  };

  // Hook personnalisé pour gérer les erreurs
  const handleError = useCallback((error, defaultMessage) => {
    notification.error({
      message: 'Erreur',
      description: error.message || defaultMessage,
      placement: 'topRight',
    });
  }, []);

  // Charger les classes
  const loadClasses = useCallback(async () => {
    if (!currentUser?.authToken || currentUser.role !== 'ADMIN') {
      setClasses([]);
      setFilteredClasses([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchClasses(currentUser.authToken);
      setClasses(data || []);
      setFilteredClasses(data || []);
    } catch (error) {
      handleError(error, 'Échec du chargement des classes');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.authToken, currentUser?.role, handleError]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Filtrer les classes
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter((cls) =>
        cls.nom.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClasses(filtered);
    }
  };

  // Supprimer une classe
  const handleDeleteClass = async (id) => {
    try {
      setLoading(true);
      await deleteClass(id, currentUser.authToken);
      notification.success({
        message: 'Succès',
        description: 'Classe supprimée avec succès',
        placement: 'topRight',
      });
      loadClasses();
    } catch (error) {
      handleError(error, 'Échec de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Soumettre le formulaire
  const handleClassSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const classData = {
        ...values,
        id_createur: currentUser.id,
        statut: values.statut !== undefined ? values.statut : true,
      };
      if (selectedClass) {
        await updateClass(selectedClass.id, classData, currentUser.authToken);
        notification.success({
          message: 'Succès',
          description: 'Classe mise à jour avec succès',
          placement: 'topRight',
        });
      } else {
        await createClass(classData, currentUser.authToken);
        notification.success({
          message: 'Succès',
          description: 'Classe créée avec succès',
          placement: 'topRight',
        });
      }
      setModalVisible(false);
      form.resetFields();
      loadClasses();
    } catch (error) {
      handleError(error, 'Échec de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  // Afficher les détails
  const handleShowDetails = (record) => {
    setSelectedClass(record);
    setClassDetails({
      ...record,
      creationDate: record.creationDate || 'Non spécifiée',
      creator: record.id_createur ? `Utilisateur ${record.id_createur}` : 'Inconnu',
    });
    setDetailsModalVisible(true);
  };

  // Dupliquer une classe
  const handleDuplicateClass = async (record) => {
    try {
      setLoading(true);
      const classData = {
        nom: `${record.nom} (Copie)`,
        id_createur: currentUser.id,
        statut: record.statut,
      };
      await createClass(classData, currentUser.authToken);
      notification.success({
        message: 'Succès',
        description: 'Classe dupliquée avec succès',
        placement: 'topRight',
      });
      loadClasses();
    } catch (error) {
      handleError(error, 'Échec de la duplication de la classe');
    } finally {
      setLoading(false);
    }
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => (
        <Tag color={statut ? '#389e0d' : '#c8102e'}>{statut ? 'Actif' : 'Inactif'}</Tag>
      ),
      sorter: (a, b) => Number(a.statut) - Number(b.statut),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedClass(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
            style={{ color: styles.secondaryColor }}
          />
          <Popconfirm
            title="Confirmer la suppression de cette classe ?"
            onConfirm={() => handleDeleteClass(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              icon={<DeleteOutlined />}
              style={{ color: styles.secondaryColor }}
            />
          </Popconfirm>
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => handleShowDetails(record)}
            style={{ color: styles.secondaryColor }}
          />
          <Tooltip title="Dupliquer la classe">
            <Button
              icon={<CopyTwoTone />}
              onClick={() => handleDuplicateClass(record)}
              style={styles.iconButtonStyle}
              aria-label="Dupliquer la classe"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <Alert
        message="Accès refusé"
        description="Vous n'avez pas les droits d'accès à cette section."
        type="error"
        showIcon
        style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e' }}
      />
    );
  }

  return (
    <div style={styles.containerStyle}>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col span={12}>
            <Input
              placeholder="Rechercher par nom"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              prefix={<SearchOutlined style={{ color: styles.primaryColor }} />}
              style={styles.inputStyle}
              size="large"
            />
          </Col>
          <Col span={12}>
            <Tooltip title="Ajouter une nouvelle classe">
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  setSelectedClass(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
                style={styles.iconButtonStyle}
                aria-label="Ajouter une nouvelle classe"
              />
            </Tooltip>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredClasses}
          loading={loading}
          rowKey={(record) => record.id}
          pagination={{
            pageSizeOptions: ['10', '20', '50'],
            showSizeChanger: true,
            defaultPageSize: 10,
          }}
          style={styles.tableStyle}
        />

        <Modal
          title={
            <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
              {selectedClass ? 'Modifier Classe' : 'Créer Nouvelle Classe'}
            </span>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
          style={styles.modalStyle}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleClassSubmit}
            style={{ maxWidth: '500px', margin: '0 auto' }}
            initialValues={{ statut: true }}
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  name="nom"
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Nom de la classe</Text>}
                  rules={[
                    { required: true, message: 'Veuillez entrer un nom' },
                    { min: 3, message: 'Le nom doit contenir au moins 3 caractères' },
                  ]}
                >
                  <Input
                    style={styles.inputStyle}
                    placeholder="Entrez le nom"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
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
                aria-label={selectedClass ? 'Modifier la classe' : 'Ajouter une classe'}
              >
                {selectedClass ? 'Modifier' : 'Ajouter'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
              Détails de la Classe
            </span>
          }
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setDetailsModalVisible(false)}
              style={{ borderRadius: '8px', background: '#c8102e', borderColor: '#c8102e', color: '#ffffff' }}
            >
              Fermer
            </Button>,
          ]}
          destroyOnClose
          style={styles.modalStyle}
        >
          {classDetails && (
            <div>
              <Typography.Paragraph>
                <Text strong style={{ color: styles.primaryColor }}>Nom :</Text> {classDetails.nom}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Text strong style={{ color: styles.primaryColor }}>Statut :</Text>{' '}
                {classDetails.statut ? 'Actif' : 'Inactif'}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Text strong style={{ color: styles.primaryColor }}>Date de Création :</Text>{' '}
                {new Date(classDetails.creationDate).toLocaleDateString()}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Text strong style={{ color: styles.primaryColor }}>Créateur :</Text> {classDetails.creator}
              </Typography.Paragraph>
            </div>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default ClassManagement;
