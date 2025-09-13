// src/components/ClassManagement.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Card,
  List,
  Checkbox,
  Dropdown,
  Menu,
} from 'antd';
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  CopyTwoTone,
  HistoryOutlined,
  BellOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { fetchClasses, createClass, updateClass, deleteClass } from '../services/apiService';

const { Text, Title } = Typography;

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

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [classHistory, setClassHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logs, setLogs] = useState([]);

  const defaultVisibleColumns = ['nom', 'statut', 'actions'];
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const styles = useMemo(() => ({
    primaryColor: '#c8102e',
    secondaryColor: '#991b1b',
    containerStyle: {
      padding: '20px',
      borderRadius: '12px',
      background: theme === 'light' ? '#ffffff' : '#1f1f1f',
      boxShadow: theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      color: theme === 'light' ? '#000000' : '#ffffff',
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
    inputStyle: {
      borderRadius: '8px',
      borderColor: '#c8102e',
      transition: 'all 0.3s ease',
      background: theme === 'light' ? '#ffffff' : '#3d3d3d',
      color: theme === 'light' ? '#000000' : '#ffffff',
    },
    tableStyle: {
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      borderRadius: '12px',
      padding: '16px',
    },
    notificationCardStyle: {
      background: theme === 'light' ? '#f0f2f5' : '#2d2d2d',
      borderColor: theme === 'light' ? '#e0e0e0' : '#4d4d4d',
      marginBottom: '20px',
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
      user: currentUser.id,
    };
    setLogs(prev => [newLog, ...prev]);
    setNotifications(prev => [newLog, ...prev].slice(0, 5));
  }, [currentUser]);

  const loadClasses = useCallback(async () => {
    if (!currentUser?.authToken || currentUser.role !== 'ADMIN') {
      setClasses([]);
      setFilteredClasses([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchClasses(currentUser.authToken);
      const classesWithHistory = data.map(cls => ({
        ...cls,
        history: cls.history || [{
          action: 'Création',
          date: new Date().toISOString(),
          user: currentUser.id,
          details: `Classe créée avec le nom '${cls.nom}'.`,
        }]
      }));
      setClasses(classesWithHistory || []);
      setFilteredClasses(classesWithHistory || []);
    } catch (error) {
      handleError(error, 'Échec du chargement des classes');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.authToken, currentUser?.role, handleError]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    const filtered = classes.filter((cls) =>
        cls.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

  const handleMassDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedRowKeys.map(id => deleteClass(id, currentUser.authToken)));
      notification.success({
        message: 'Succès',
        description: `${selectedRowKeys.length} classes supprimées avec succès.`,
        placement: 'topRight',
      });
      addActionLog('suppression_masse', `${selectedRowKeys.length} classes ont été supprimées en masse.`);
      setSelectedRowKeys([]);
      loadClasses();
    } catch (error) {
      handleError(error, 'Échec de la suppression de masse');
    } finally {
      setLoading(false);
    }
  };

  const handleMassUpdate = async (status) => {
    try {
      setLoading(true);
      const updates = selectedRowKeys.map(id => {
        const classToUpdate = classes.find(c => c.id === id);
        return updateClass(id, { ...classToUpdate, statut: status }, currentUser.authToken);
      });
      await Promise.all(updates);
      notification.success({
        message: 'Succès',
        description: `Statut de ${selectedRowKeys.length} classes mis à jour avec succès.`,
        placement: 'topRight',
      });
      addActionLog('modification_masse', `Statut de ${selectedRowKeys.length} classes a été mis à jour.`);
      setSelectedRowKeys([]);
      loadClasses();
    } catch (error) {
      handleError(error, 'Échec de la mise à jour de masse');
    } finally {
      setLoading(false);
    }
  };

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
        addActionLog('modification', `La classe '${values.nom}' a été mise à jour.`);
      } else {
        await createClass(classData, currentUser.authToken);
        notification.success({
          message: 'Succès',
          description: 'Classe créée avec succès',
          placement: 'topRight',
        });
        addActionLog('création', `Une nouvelle classe '${values.nom}' a été créée.`);
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

  // Définition des fonctions manquantes pour le rendu du tableau
  const handleDeleteClass = async (id) => {
    try {
      setLoading(true);
      await deleteClass(id, currentUser.authToken);
      notification.success({
        message: 'Succès',
        description: 'Classe supprimée avec succès',
        placement: 'topRight',
      });
      addActionLog('suppression', `La classe ID ${id} a été supprimée.`);
      loadClasses();
    } catch (error) {
      handleError(error, 'Échec de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (record) => {
    setSelectedClass(record);
    setClassDetails({
      ...record,
      creationDate: record.creationDate || 'Non spécifiée',
      creator: record.id_createur ? `Utilisateur ${record.id_createur}` : 'Inconnu',
    });
    setDetailsModalVisible(true);
  };

  const handleShowHistory = (record) => {
    setClassHistory(record.history || []);
    setHistoryModalVisible(true);
  };

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
      addActionLog('duplication', `La classe '${record.nom}' a été dupliquée.`);
      loadClasses();
    } catch (error) {
      handleError(error, 'Échec de la duplication de la classe');
    } finally {
      setLoading(false);
    }
  };

  const allColumns = [
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
            <Tooltip title="Modifier la classe">
              <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedClass(record);
                    form.setFieldsValue(record);
                    setModalVisible(true);
                  }}
                  style={{ color: styles.secondaryColor }}
                  aria-label="Modifier la classe"
              />
            </Tooltip>
            <Popconfirm
                title="Confirmer la suppression de cette classe ?"
                onConfirm={() => handleDeleteClass(record.id)}
                okText="Oui"
                cancelText="Non"
            >
              <Tooltip title="Supprimer la classe">
                <Button
                    icon={<DeleteOutlined />}
                    style={{ color: styles.secondaryColor }}
                    aria-label="Supprimer la classe"
                />
              </Tooltip>
            </Popconfirm>
            <Tooltip title="Afficher les détails">
              <Button
                  icon={<InfoCircleOutlined />}
                  onClick={() => handleShowDetails(record)}
                  style={{ color: styles.secondaryColor }}
                  aria-label="Afficher les détails"
              />
            </Tooltip>
            <Tooltip title="Afficher l'historique">
              <Button
                  icon={<HistoryOutlined />}
                  onClick={() => handleShowHistory(record)}
                  style={{ color: styles.secondaryColor }}
                  aria-label="Afficher l'historique"
              />
            </Tooltip>
            <Tooltip title="Dupliquer la classe">
              <Button
                  icon={<CopyTwoTone />}
                  onClick={() => handleDuplicateClass(record)}
                  aria-label="Dupliquer la classe"
              />
            </Tooltip>
          </Space>
      ),
    },
  ];

  const columns = allColumns.filter(col => visibleColumns.includes(col.key));

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
        <Alert
            message="Accès refusé"
            description="Vous n'avez pas les droits d'accès à cette section."
            type="error"
            showIcon
            style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e', color: theme === 'light' ? '#000000' : '#ffffff' }}
        />
    );
  }

  return (
      <div style={styles.containerStyle}>
        <Spin spinning={loading}>
          <Title level={2} style={{ color: styles.primaryColor, textAlign: 'center', marginBottom: '20px' }}>
            Gestion des Classes
          </Title>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card title={<Space><BellOutlined /> Notifications récentes</Space>} style={styles.notificationCardStyle}>
                <List
                    dataSource={notifications}
                    renderItem={item => (
                        <List.Item>
                          <Tag color={item.action === 'création' ? 'green' : (item.action.includes('suppression') ? 'red' : 'blue')}>
                            {item.action.toUpperCase()}
                          </Tag>
                          <Text>{item.message} ({new Date(item.timestamp).toLocaleTimeString()})</Text>
                        </List.Item>
                    )}
                    locale={{ emptyText: "Aucune notification récente." }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={<Space><FileTextOutlined /> Journal d'activités</Space>} style={styles.notificationCardStyle}>
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => setLogModalVisible(true)}
                    style={{ ...styles.buttonStyle, width: '100%' }}
                >
                  Voir tous les logs
                </Button>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: '20px', alignItems: 'center' }}>
            <Col xs={24} md={10}>
              <Input
                  placeholder="Rechercher par nom"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  prefix={<SearchOutlined style={{ color: styles.primaryColor }} />}
                  style={styles.inputStyle}
                  size="large"
              />
            </Col>
            <Col xs={24} md={14} style={{ textAlign: 'right' }}>
              <Space>
                <Tooltip title="Ajouter une nouvelle classe">
                  <Button
                      type="primary"
                      icon={<PlusCircleOutlined />}
                      onClick={() => {
                        setSelectedClass(null);
                        form.resetFields();
                        setModalVisible(true);
                      }}
                      style={styles.buttonStyle}
                      aria-label="Ajouter une nouvelle classe"
                  >
                    Ajouter une classe
                  </Button>
                </Tooltip>
                {selectedRowKeys.length > 0 && (
                    <>
                      <Popconfirm
                          title="Confirmer la suppression des classes sélectionnées ?"
                          onConfirm={handleMassDelete}
                          okText="Oui"
                          cancelText="Non"
                      >
                        <Button type="primary" danger icon={<DeleteOutlined />} style={styles.buttonStyle} aria-label="Supprimer les classes sélectionnées">
                          Supprimer ({selectedRowKeys.length})
                        </Button>
                      </Popconfirm>
                      <Button onClick={() => handleMassUpdate(true)} style={{...styles.buttonStyle, backgroundColor: '#389e0d'}} aria-label="Activer les classes sélectionnées">
                        Activer
                      </Button>
                      <Button onClick={() => handleMassUpdate(false)} style={{...styles.buttonStyle, backgroundColor: '#c8102e'}} aria-label="Désactiver les classes sélectionnées">
                        Désactiver
                      </Button>
                    </>
                )}
                <Dropdown
                    overlay={
                      <Menu>
                        {allColumns.map(col => (
                            <Menu.Item key={col.key}>
                              <Checkbox
                                  checked={visibleColumns.includes(col.key)}
                                  onChange={() => {
                                    setVisibleColumns(prev =>
                                        prev.includes(col.key)
                                            ? prev.filter(c => c !== col.key)
                                            : [...prev, col.key]
                                    );
                                  }}
                              >
                                {col.title}
                              </Checkbox>
                            </Menu.Item>
                        ))}
                      </Menu>
                    }
                    trigger={['click']}
                >
                  <Button icon={<SettingOutlined />} style={styles.buttonStyle} aria-label="Personnaliser les colonnes">
                    Personnaliser les colonnes
                  </Button>
                </Dropdown>
              </Space>
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
              rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              style={styles.tableStyle}
          />

          {/* Modal pour le formulaire de classe */}
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
                      label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Nom de la classe</Text>}
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
                      label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Statut (Actif/Inactif)</Text>}
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

          {/* Modal pour les détails de la classe */}
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

          {/* Modal pour l'historique des modifications */}
          <Modal
              title={<span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>Historique des modifications</span>}
              open={historyModalVisible}
              onCancel={() => setHistoryModalVisible(false)}
              footer={null}
              destroyOnClose
              style={styles.modalStyle}
          >
            <List
                dataSource={classHistory}
                renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                          title={
                            <Text strong>
                              {item.action} par {item.user}
                            </Text>
                          }
                          description={
                            <>
                              <Text type="secondary">{new Date(item.date).toLocaleString()}</Text>
                              <br />
                              <Text>{item.details}</Text>
                            </>
                          }
                      />
                    </List.Item>
                )}
                locale={{ emptyText: "Aucun historique disponible pour cette classe." }}
            />
          </Modal>

          {/* Modal pour le journal d'activités */}
          <Modal
              title={<span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>Journal d'activités</span>}
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
                  { title: 'Action', dataIndex: 'action', key: 'action' },
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

export default ClassManagement;