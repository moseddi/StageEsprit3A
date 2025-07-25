import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, message, Space, Popconfirm, Button, Tag, Alert, Row, Col, Typography } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserOutlined, LockOutlined, MailOutlined, UserSwitchOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchUtilisateurs, createUser, updateUser, deleteUser } from '../services/apiService';

const { Option } = Select;
const { Title, Text } = Typography;

const UserManagement = ({ currentUser }) => {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState('');

    const loadUtilisateurs = async () => {
        if (!currentUser?.authToken || currentUser.role !== 'ADMIN') return;
        setLoading(true);
        try {
            const data = await fetchUtilisateurs(currentUser.authToken);
            setUtilisateurs(data);
            setFilteredUtilisateurs(data); // Initialize filtered list
        } catch (error) {
            message.error("Erreur lors du chargement des utilisateurs : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.authToken && currentUser.role === 'ADMIN') {
            loadUtilisateurs();
        }
    }, [currentUser?.authToken, currentUser?.role]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value.trim() === '') {
            setFilteredUtilisateurs(utilisateurs); // Restore full list if search is empty
        } else {
            const filtered = utilisateurs.filter(user =>
                user.nom.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredUtilisateurs(filtered);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await deleteUser(id, currentUser.authToken);
            message.success('Utilisateur supprimé avec succès');
            loadUtilisateurs();
        } catch (error) {
            message.error("Échec de la suppression de l'utilisateur : " + error.message);
        }
    };

    const handleUserSubmit = async () => {
        try {
            const values = await form.validateFields();
            const userData = {
                nom: values.nom,
                email: values.email,
                role: values.role,
                ...(values.motDePasse && { password: values.motDePasse })
            };
            if (selectedUser) {
                await updateUser(selectedUser.id, userData, currentUser.authToken);
                message.success('Utilisateur mis à jour avec succès');
            } else {
                await createUser(userData, currentUser.authToken);
                message.success('Utilisateur créé avec succès');
            }
            setModalVisible(false);
            form.resetFields();
            loadUtilisateurs();
        } catch (error) {
            message.error(error.message || 'Échec de la soumission');
        }
    };

    const columns = [
        { title: 'Nom', dataIndex: 'nom', key: 'nom' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Rôle',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <EditOutlined
                        className="text-blue-500 cursor-pointer"
                        onClick={() => {
                            setSelectedUser(record);
                            form.setFieldsValue({ ...record, motDePasse: '' });
                            setModalVisible(true);
                        }}
                    />
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <DeleteOutlined className="text-red-500 cursor-pointer" />
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
            />
        );
    }

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                    <Button
                        type="primary"
                        icon={<PlusCircleOutlined />}
                        onClick={() => {
                            setSelectedUser(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                        className="bg-red-500 hover:bg-red-600 rounded-lg"
                        size="large"
                    >
                        Ajouter Utilisateur
                    </Button>
                </Col>
                <Col span={12}>
                    <Input
                        placeholder="Rechercher par nom"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        prefix={<SearchOutlined style={{ color: '#ff69b4' }} />}
                        style={{
                            borderRadius: '8px',
                            borderColor: '#ff69b4',
                            transition: 'all 0.3s ease',
                            width: '100%',
                        }}
                        size="large"
                    />
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={filteredUtilisateurs}
                loading={loading}
                rowKey={(record) => record.id || record.email}
                pagination={{ pageSize: 10 }}
                className="ant-table-striped"
                style={{ background: '#fff0f5', borderRadius: '12px', padding: '10px' }}
            />
            <Modal
                title={<span style={{ color: '#ff69b4', fontSize: '20px', fontWeight: 'bold' }}>{selectedUser ? 'Modifier Utilisateur' : 'Créer Nouvel Utilisateur'}</span>}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                destroyOnClose
                style={{ borderRadius: '12px', background: '#fff0f5', padding: '20px', boxShadow: '0 4px 12px rgba(255, 105, 180, 0.2)' }}
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
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Nom complet</Text>}
                                rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
                            >
                                <Input
                                    style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                                    prefix={<UserOutlined style={{ color: '#ff69b4' }} />}
                                    placeholder="John Doe"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Email</Text>}
                                rules={[{ required: true, type: 'email', message: 'Veuillez entrer un email valide!' }]}
                            >
                                <Input
                                    style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                                    prefix={<MailOutlined style={{ color: '#ff69b4' }} />}
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
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Mot de passe</Text>}
                                rules={[{ required: !selectedUser, message: 'Veuillez entrer le mot de passe!' }]}
                            >
                                <Input.Password
                                    style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                                    prefix={<LockOutlined style={{ color: '#ff69b4' }} />}
                                    placeholder="••••••••"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Rôle</Text>}
                                rules={[{ required: true, message: 'Veuillez sélectionner un rôle!' }]}
                            >
                                <Select
                                    style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
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
                            icon={<UserSwitchOutlined />}
                            onMouseEnter={(e) => { e.target.style.background = '#c8102e'; }}
                            onMouseLeave={(e) => { e.target.style.background = '#ff69b4'; }}
                        >
                            {selectedUser ? 'Mettre à jour' : 'Créer'} Utilisateur
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;