// src/components/UserManagement.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Switch,
  Dropdown,
  Menu,
  Statistic,
  Card,
  List,
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
  DownloadOutlined,
  DeleteFilled,
  FilterOutlined,
  CheckOutlined,
  StopOutlined,
  MoreOutlined,
  BellOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { fetchUtilisateurs, createUser, updateUser, deleteUser } from '../services/apiService';
import { CSVLink } from 'react-csv';

const { Option } = Select;
const { Text, Title } = Typography;

const UserManagement = ({ currentUser, theme }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [logs, setLogs] = useState([]);
  const [logModalVisible, setLogModalVisible] = useState(false);

  const styles = useMemo(() => ({
    primaryColor: '#c8102e',
    secondaryColor: '#991b1b',
    containerStyle: {
      padding: '30px',
      borderRadius: '16px',
      background: theme === 'light' ? '#f0f2f5' : '#1f1f1f',
      transition: 'all 0.3s ease',
      color: theme === 'light' ? '#000000' : '#ffffff',
    },
    cardStyle: {
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      borderRadius: '12px',
      boxShadow: theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(255, 255, 255, 0.05)',
      border: 'none',
    },
    buttonStyle: {
      background: '#c8102e',
      color: '#ffffff',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      border: 'none',
      fontWeight: '600',
    },
    iconButtonStyle: {
      background: theme === 'light' ? '#f0f2f5' : '#3d3d3d',
      color: '#c8102e',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: theme === 'light' ? '1px solid #e0e0e0' : '1px solid #4d4d4d',
    },
    inputStyle: {
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      background: theme === 'light' ? '#ffffff' : '#3d3d3d',
      borderColor: theme === 'light' ? '#d9d9d9' : '#4d4d4d',
      color: theme === 'light' ? '#000000' : '#ffffff',
    },
    tableStyle: {
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      borderRadius: '12px',
      padding: '16px',
    },
    modalStyle: {
      borderRadius: '12px',
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
  }), [theme]);

  const handleError = useCallback((error, defaultMessage) => {
    notification.error({
      message: 'Erreur',
      description: error.message || defaultMessage,
      placement: 'topRight',
    });
  }, []);

  const addActionLog = useCallback((action, message) => {
    const newLog = {
      id: Date.now(),
      action,
      message,
      timestamp: new Date().toISOString(),
      user: currentUser.nom || 'Admin',
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  }, [currentUser]);

  const applyFilters = useCallback((data, search, role, status) => {
    let filtered = [...data];
    if (search.trim() !== '') {
      filtered = filtered.filter((user) =>
          user.nom.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (role !== 'all') {
      filtered = filtered.filter((user) => user.role === role);
    }
    if (status !== 'all') {
      filtered = filtered.filter((user) => user.active === (status === 'active'));
    }
    setFilteredUtilisateurs(filtered);
  }, []);

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
      applyFilters(data || [], searchTerm, filterRole, filterStatus);
    } catch (error) {
      handleError(error, 'Échec du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.authToken, currentUser?.role, handleError, applyFilters, searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    loadUtilisateurs();
  }, [loadUtilisateurs]);

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    applyFilters(utilisateurs, value, filterRole, filterStatus);
  };

  const handleFilterRole = (role) => {
    setFilterRole(role);
    applyFilters(utilisateurs, searchTerm, role, filterStatus);
  };

  const handleFilterStatus = (status) => {
    setFilterStatus(status);
    applyFilters(utilisateurs, searchTerm, filterRole, status);
  };

  const handleDeleteUser = async (id) => {
    try {
      setLoading(true);
      await deleteUser(id, currentUser.authToken);
      notification.success({
        message: 'Succès',
        description: 'Utilisateur supprimé avec succès',
        placement: 'topRight',
      });
      addActionLog('Suppression', `L'utilisateur avec l'ID ${id} a été supprimé.`);
      loadUtilisateurs();
    } catch (error) {
      handleError(error, 'Échec de la suppression de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(
          selectedRowKeys.map((id) => deleteUser(id, currentUser.authToken))
      );
      notification.success({
        message: 'Succès',
        description: `${selectedRowKeys.length} utilisateur(s) supprimé(s) avec succès`,
        placement: 'topRight',
      });
      addActionLog('Suppression en masse', `${selectedRowKeys.length} utilisateurs ont été supprimés.`);
      setSelectedRowKeys([]);
      loadUtilisateurs();
    } catch (error) {
      handleError(error, 'Échec de la suppression des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, active) => {
    try {
      setLoading(true);
      await updateUser(id, { active }, currentUser.authToken);
      notification.success({
        message: 'Succès',
        description: `Utilisateur ${active ? 'activé' : 'désactivé'} avec succès`,
        placement: 'topRight',
      });
      addActionLog('Modification du statut', `Le statut de l'utilisateur ID ${id} a été mis à jour à '${active ? 'actif' : 'inactif'}'`);
      loadUtilisateurs();
    } catch (error) {
      handleError(error, 'Échec de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await Promise.all(selectedRowKeys.map(id => updateUser(id, { active: newStatus }, currentUser.authToken)));
      notification.success({
        message: 'Succès',
        description: `Statut de ${selectedRowKeys.length} utilisateur(s) mis à jour.`,
        placement: 'topRight',
      });
      addActionLog('Modification de statut en masse', `Le statut de ${selectedRowKeys.length} utilisateurs a été mis à jour à '${newStatus ? 'actif' : 'inactif'}'.`);
      setSelectedRowKeys([]);
      loadUtilisateurs();
    } catch (error) {
      handleError(error, 'Échec de la mise à jour de masse');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const userData = {
        nom: values.nom,
        email: values.email,
        role: values.role,
        active: values.active !== undefined ? values.active : true,
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
        addActionLog('Modification', `L'utilisateur '${values.nom}' a été mis à jour.`);
      } else {
        await createUser(userData, currentUser.authToken);
        notification.success({
          message: 'Succès',
          description: 'Utilisateur créé avec succès',
          placement: 'topRight',
        });
        addActionLog('Création', `Un nouvel utilisateur '${values.nom}' a été créé.`);
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

  const csvData = filteredUtilisateurs.map((user) => ({
    Nom: user.nom,
    Email: user.email,
    Role: user.role,
    Status: user.active ? 'Actif' : 'Inactif',
    DateCreation: new Date(user.createdAt).toLocaleDateString(),
  }));

  const filterMenu = (
      <Menu style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', color: theme === 'light' ? '#000' : '#fff' }}>
        <Menu.SubMenu title="Rôle">
          <Menu.Item onClick={() => handleFilterRole('all')}>Tous</Menu.Item>
          <Menu.Item onClick={() => handleFilterRole('ADMIN')}>Administrateur</Menu.Item>
          <Menu.Item onClick={() => handleFilterRole('EVALUATEUR')}>Évaluateur</Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu title="Statut">
          <Menu.Item onClick={() => handleFilterStatus('all')}>Tous</Menu.Item>
          <Menu.Item onClick={() => handleFilterStatus('active')}>Actif</Menu.Item>
          <Menu.Item onClick={() => handleFilterStatus('inactive')}>Inactif</Menu.Item>
        </Menu.SubMenu>
      </Menu>
  );

  const bulkActionsMenu = (
      <Menu style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', color: theme === 'light' ? '#000' : '#fff' }}>
        <Menu.Item key="activate" icon={<CheckOutlined />} onClick={() => handleBulkStatusChange(true)}>
          Activer la sélection
        </Menu.Item>
        <Menu.Item key="deactivate" icon={<StopOutlined />} onClick={() => handleBulkStatusChange(false)}>
          Désactiver la sélection
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="delete" danger icon={<DeleteFilled />} onClick={handleBulkDelete}>
          Supprimer la sélection
        </Menu.Item>
      </Menu>
  );

  const totalUsers = utilisateurs.length;
  const numAdmins = utilisateurs.filter((u) => u.role === 'ADMIN').length;
  const numEVALUATEURs = utilisateurs.filter((u) => u.role === 'EVALUATEUR').length;
  const numActiveAdmins = utilisateurs.filter((u) => u.role === 'ADMIN' && u.active).length;
  const numInactiveAdmins = numAdmins - numActiveAdmins;
  const numActiveEVALUATEURs = utilisateurs.filter((u) => u.role === 'EVALUATEUR' && u.active).length;
  const numInactiveEVALUATEURs = numEVALUATEURs - numActiveEVALUATEURs;

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
          <Tag color={role === 'ADMIN' ? styles.primaryColor : '#2b6cb0'}>{role}</Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) => (
          <Switch
              checked={active}
              onChange={(checked) => handleStatusToggle(record.id, checked)}
              checkedChildren="Actif"
              unCheckedChildren="Inactif"
          />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
          <Space>
            <Tooltip title="Voir les détails">
              <Button
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedUser(record);
                    setDetailsModalVisible(true);
                  }}
                  style={{ color: '#389e0d' }}
              />
            </Tooltip>
            <Tooltip title="Modifier">
              <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedUser(record);
                    form.setFieldsValue({ ...record, motDePasse: '' });
                    setModalVisible(true);
                  }}
                  style={{ color: styles.secondaryColor }}
              />
            </Tooltip>
            <Tooltip title="Supprimer">
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
            </Tooltip>
          </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
        <Alert
            message="Accès refusé"
            description="Vous n'avez pas l'autorisation pour accéder à cette page."
            type="error"
            showIcon
            style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e', color: theme === 'light' ? '#000000' : '#ffffff' }}
        />
    );
  }

  return (
      <div style={styles.containerStyle}>
        <Spin spinning={loading}>
          <Title level={2} style={{ color: styles.primaryColor, textAlign: 'center', marginBottom: '30px' }}>
            Gestion des Utilisateurs
          </Title>

          <Row gutter={[24, 24]} style={{ marginBottom: '30px' }}>
            <Col xs={24} md={6}>
              <Card style={styles.cardStyle} bordered={false}>
                <Statistic title="Total Utilisateurs" value={totalUsers} prefix={<UserOutlined style={{ color: styles.primaryColor }} />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={styles.cardStyle} bordered={false}>
                <Statistic title="Administrateurs" value={numAdmins} prefix={<LockOutlined style={{ color: styles.primaryColor }} />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={styles.cardStyle} bordered={false}>
                <Statistic title="Évaluateurs" value={numEVALUATEURs} prefix={<UserSwitchOutlined style={{ color: styles.primaryColor }} />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={styles.cardStyle} bordered={false}>
                <Statistic title="Inactifs" value={numInactiveAdmins + numInactiveEVALUATEURs} prefix={<StopOutlined style={{ color: styles.secondaryColor }} />} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                  placeholder="Rechercher par nom ou email"
                  value={searchTerm}
                  onChange={handleSearch}
                  prefix={<SearchOutlined style={{ color: styles.primaryColor }} />}
                  style={styles.inputStyle}
                  size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
              <Space size="large" wrap>
                <Dropdown overlay={filterMenu} trigger={['click']}>
                  <Button style={styles.buttonStyle} icon={<FilterOutlined />}>
                    Filtres
                  </Button>
                </Dropdown>
                <CSVLink
                    data={csvData}
                    filename={`utilisateurs-${new Date().toISOString().split('T')[0]}.csv`}
                >
                  <Button style={styles.buttonStyle} icon={<DownloadOutlined />}>
                    Exporter CSV
                  </Button>
                </CSVLink>
                {selectedRowKeys.length > 0 && (
                    <Dropdown overlay={bulkActionsMenu} trigger={['click']}>
                      <Button style={styles.buttonStyle} icon={<MoreOutlined />}>
                        Actions de Masse ({selectedRowKeys.length})
                      </Button>
                    </Dropdown>
                )}
                <Button onClick={() => setLogModalVisible(true)} style={styles.buttonStyle} icon={<BellOutlined />}>
                  Journal d'activité
                </Button>
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
              </Space>
            </Col>
          </Row>

          <Table
              rowSelection={rowSelection}
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
                initialValues={selectedUser || { active: true }}
                style={{ maxWidth: '500px', margin: '0 auto' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                      name="nom"
                      label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Nom complet</Text>}
                      rules={[
                        { required: true, message: 'Veuillez entrer le nom!' },
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
                      label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Email</Text>}
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
                      label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Mot de passe</Text>}
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
                      label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Rôle</Text>}
                      rules={[{ required: true, message: 'Veuillez sélectionner un rôle!' }]}
                  >
                    <Select
                        style={styles.inputStyle}
                        size="large"
                        placeholder="Sélectionner un rôle"
                    >
                      <Option value="ADMIN">Administrateur</Option>
                      <Option value="EVALUATEUR">Évaluateur</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                      name="active"
                      label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Statut</Text>}
                      valuePropName="checked"
                  >
                    <Switch checkedChildren="Actif" unCheckedChildren="Inactif" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    style={{ ...styles.buttonStyle, width: '100%' }}
                    icon={<UserSwitchOutlined />}
                >
                  {selectedUser ? 'Mettre à jour' : 'Ajouter'}
                </Button>
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
                    style={{ ...styles.buttonStyle, background: '#991b1b' }}
                >
                  Fermer
                </Button>,
              ]}
              destroyOnClose
              style={styles.modalStyle}
          >
            {selectedUser && (
                <Descriptions bordered column={1} style={{ ...styles.cardStyle, padding: 0 }}>
                  <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Nom complet</Text>}>
                    {selectedUser.nom}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Email</Text>}>
                    {selectedUser.email}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Rôle</Text>}>
                    <Tag color={selectedUser.role === 'ADMIN' ? styles.primaryColor : '#2b6cb0'}>{selectedUser.role}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={<Text strong style={{ color: styles.primaryColor }}>Statut</Text>}>
                    <Tag color={selectedUser.active ? '#389e0d' : '#ff4d4f'}>
                      {selectedUser.active ? 'Actif' : 'Inactif'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
            )}
          </Modal>

          <Modal
              title={
                <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
                    Journal d'activité
                </span>
              }
              open={logModalVisible}
              onCancel={() => setLogModalVisible(false)}
              footer={null}
              width={800}
              destroyOnClose
              style={styles.modalStyle}
          >
            <Table
                dataSource={logs}
                columns={[
                  {
                    title: 'Action',
                    dataIndex: 'action',
                    key: 'action',
                    render: (text) => {
                      let color = 'blue';
                      let icon = <InfoCircleOutlined />;
                      if (text.includes('Suppression')) {
                        color = 'red';
                        icon = <ExclamationCircleOutlined />;
                      } else if (text.includes('Création')) {
                        color = 'green';
                        icon = <CheckCircleOutlined />;
                      }
                      return <Tag color={color} icon={icon}>{text}</Tag>;
                    },
                  },
                  { title: 'Message', dataIndex: 'message', key: 'message' },
                  { title: 'Utilisateur', dataIndex: 'user', key: 'user' },
                  { title: 'Date', dataIndex: 'timestamp', key: 'timestamp', render: (text) => new Date(text).toLocaleString() },
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />
          </Modal>
        </Spin>
      </div>
  );
};

export default UserManagement;