
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  Button,
  Tag,
  Alert,
  Row,
  Col,
  Typography,
  Descriptions,
  Spin,
  notification,
  Tooltip,
} from 'antd';
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UserSwitchOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { fetchUtilisateurs, createUser, updateUser, deleteUser } from '../services/apiService';

const { Option } = Select;
const { Text } = Typography;

const UserManagement = ({ currentUser, theme }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
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
    },
    inputStyle: {
      borderRadius: '8px',
      borderColor: '#c8102e',
      transition: 'all 0.3s ease',
    },
    selectStyle: {
      borderRadius: '8px',
      borderColor: '#c8102e',
      transition: 'all 0.3s ease',
    },
    tableStyle: {
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      borderRadius: '12px',
      padding: '16px',
    },
    descriptionsStyle: {
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      borderRadius: '8px',
      padding: '16px',
      border: `1px solid #c8102e`,
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

  // Charger les utilisateurs
  const loadUtilisateurs = useCallback(async () => {
    if (!currentUser?.authToken || currentUser.role !== 'ADMIN') {
      setUtilisateurs([]);
      setFilteredUtilisateurs([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchUtilisateurs(currentUser.authToken);
      setUtilisateurs(data || []);
      setFilteredUtilisateurs(data || []);
    } catch (error) {
      handleError(error, 'Échec du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.authToken, currentUser?.role, handleError]);

  useEffect(() => {
    loadUtilisateurs();
  }, [loadUtilisateurs]);

  // Filtrer les utilisateurs
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredUtilisateurs(utilisateurs);
    } else {
      const filtered = utilisateurs.filter((user) =>
        user.nom.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUtilisateurs(filtered);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (id) => {
    try {
      setLoading(true);
      await deleteUser(id, currentUser.authToken);
      notification.success({
        message: 'Succès',
        description: 'Utilisateur supprimé avec succès',
        placement: 'topRight',
      });
      loadUtilisateurs();
    } catch (error) {
      handleError(error, 'Échec de la suppression de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  // Soumettre le formulaire
  const handleUserSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const userData = {
        nom: values.nom,
        email: values.email,
        role: values.role,
        ...(values.motDePasse && { password: values.motDePasse }),
        id_createur: currentUser.id,
      };
      if (selectedUser) {
        await updateUser(selectedUser.id, userData, currentUser.authToken);
        notification.success({
          message: 'Succès',
          description: 'Utilisateur mis à jour avec succès',
          placement: 'topRight',
        });
      } else {
        await createUser(userData, currentUser.authToken);
        notification.success({
          message: 'Succès',
          description: 'Utilisateur créé avec succès',
          placement: 'topRight',
        });
      }
      setModalVisible(false);
      form.resetFields();
      loadUtilisateurs();
    } catch (error) {
      handleError(error, 'Échec de la soumission');
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? '#c8102e' : '#2b6cb0'}>{role}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setDetailsModalVisible(true);
            }}
            style={{ color: '#389e0d' }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedUser(record);
              form.setFieldsValue({ ...record, motDePasse: '' });
              setModalVisible(true);
            }}
            style={{ color: styles.secondaryColor }}
          />
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              icon={<DeleteOutlined />}
              style={{ color: styles.secondaryColor }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <Alert
        message="Accès refusé"
        description="Vous n'avez pas l'autorisation pour accéder à cette page."
        type="error"
        showIcon
        style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e' }}
      />
    );
  }

  return (
    <div style={styles.containerStyle}>
      <Spin spinning={loading}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
          <Col />
          <Col />
        </Row>

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
            <Tooltip title="Ajouter un nouvel utilisateur">
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  setSelectedUser(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
                style={styles.iconButtonStyle}
                aria-label="Ajouter un nouvel utilisateur"
              />
            </Tooltip>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUtilisateurs}
          loading={loading}
          rowKey={(record) => record.id || record.email}
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
              {selectedUser ? 'Modifier Utilisateur' : 'Créer Nouvel Utilisateur'}
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
            onFinish={handleUserSubmit}
            initialValues={selectedUser || {}}
            style={{ maxWidth: '500px', margin: '0 auto' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="nom"
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Nom complet</Text>}
                  rules={[
                    { required: true, message: 'Veuillez entrer votre nom!' },
                    { min: 3, message: 'Le nom doit contenir au moins 3 caractères!' },
                  ]}
                >
                  <Input
                    style={styles.inputStyle}
                    prefix={<UserOutlined style={{ color: styles.primaryColor }} />}
                    placeholder="John Doe"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Email</Text>}
                  rules={[{ required: true, type: 'email', message: 'Veuillez entrer un email valide!' }]}
                >
                  <Input
                    style={styles.inputStyle}
                    prefix={<MailOutlined style={{ color: styles.primaryColor }} />}
                    placeholder="exemple@esprit.tn"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="motDePasse"
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Mot de passe</Text>}
                  rules={[{ required: !selectedUser, message: 'Veuillez entrer le mot de passe!' }]}
                >
                  <Input.Password
                    style={styles.inputStyle}
                    prefix={<LockOutlined style={{ color: styles.primaryColor }} />}
                    placeholder="••••••••"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Rôle</Text>}
                  rules={[{ required: true, message: 'Veuillez sélectionner un rôle!' }]}
                >
                  <Select
                    style={styles.selectStyle}
                    size="large"
                    placeholder="Sélectionner un rôle"
                  >
                    <Option value="ADMIN">Administrateur</Option>
                    <Option value="EVALUATOR">Évaluateur</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Tooltip title={selectedUser ? 'Mettre à jour l\'utilisateur' : 'Créer un utilisateur'}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={styles.buttonStyle}
                  icon={<UserSwitchOutlined />}
                  aria-label={selectedUser ? 'Mettre à jour l\'utilisateur' : 'Créer un utilisateur'}
                />
              </Tooltip>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
              Détails de l'Utilisateur
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
          {selectedUser && (
            <Descriptions bordered column={1} style={styles.descriptionsStyle}>
              <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Nom complet</Text>}>
                {selectedUser.nom}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Email</Text>}>
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Rôle</Text>}>
                <Tag color={selectedUser.role === 'ADMIN' ? '#c8102e' : '#2b6cb0'}>{selectedUser.role}</Tag>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Spin>
    </div>
  );
};

export default UserManagement;
