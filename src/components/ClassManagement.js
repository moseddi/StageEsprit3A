import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, message, Space, Popconfirm, Button, Alert, Row, Col, Typography } from 'antd';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { fetchClasses, createClass, updateClass, deleteClass } from '../services/apiService';

const { Text } = Typography;

const ClassManagement = ({ currentUser }) => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [form] = Form.useForm();
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [classDetails, setClassDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadClasses = useCallback(async () => {
        if (!currentUser?.authToken || currentUser.role !== 'ADMIN') {
            setClasses([]);
            setFilteredClasses([]);
            return;
        }
        setLoading(true);
        try {
            const data = await fetchClasses(currentUser.authToken);
            setClasses(data);
            setFilteredClasses(data); // Initialize filtered list
        } catch (error) {
            message.error('Échec du chargement des classes : ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.authToken, currentUser?.role]);

    useEffect(() => {
        loadClasses();
    }, [loadClasses]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value.trim() === '') {
            setFilteredClasses(classes); // Restore full list if search is empty
        } else {
            const filtered = classes.filter(cls =>
                cls.nom.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredClasses(filtered);
        }
    };

    const handleDeleteClass = async (id) => {
        try {
            await deleteClass(id, currentUser.authToken);
            message.success('Classe supprimée avec succès');
            loadClasses();
        } catch (error) {
            message.error('Échec de la suppression : ' + error.message);
        }
    };

    const handleClassSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (selectedClass) {
                await updateClass(selectedClass.id, values, currentUser.authToken);
                message.success('Classe mise à jour avec succès');
            } else {
                await createClass(values, currentUser.authToken);
                message.success('Classe créée avec succès');
            }
            setModalVisible(false);
            form.resetFields();
            loadClasses();
        } catch (error) {
            message.error(error.message || 'Échec de l\'opération');
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

    const columns = [
        { title: 'Nom', dataIndex: 'nom', key: 'nom' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined className="text-red-500 cursor-pointer" onClick={() => {
                        setSelectedClass(record);
                        form.setFieldsValue(record);
                        setModalVisible(true);
                    }} />
                    <Popconfirm title="Confirmer la suppression de cette classe ?" onConfirm={() => handleDeleteClass(record.id)} okText="Oui" cancelText="Non">
                        <DeleteOutlined className="text-red-500 cursor-pointer" />
                    </Popconfirm>
                    <InfoCircleOutlined className="text-red-500 cursor-pointer" onClick={() => handleShowDetails(record)} />
                </Space>
            ),
        },
    ];

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return (
            <Alert message="Accès refusé" description="Vous n'avez pas les droits d'accès à cette section." type="error" showIcon />
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
                            setSelectedClass(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                        className="bg-red-500 hover:bg-red-600 rounded-lg"
                        size="large"
                    >
                        Ajouter Classe
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
                dataSource={filteredClasses}
                loading={loading}
                rowKey={(record) => record.id}
                pagination={{ pageSize: 10 }}
                className="ant-table-striped"
                style={{ background: '#fff0f5', borderRadius: '12px', padding: '10px' }}
            />
            <Modal
                title={<span style={{ color: '#ff69b4', fontSize: '20px', fontWeight: 'bold' }}>{selectedClass ? 'Modifier Classe' : 'Créer Nouvelle Classe'}</span>}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
                style={{ borderRadius: '12px', background: '#fff0f5', padding: '20px', boxShadow: '0 4px 12px rgba(255, 105, 180, 0.2)' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleClassSubmit}
                    style={{ maxWidth: '500px', margin: '0 auto' }}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="nom"
                                label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Nom de la classe</Text>}
                                rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
                            >
                                <Input
                                    style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                                    placeholder="Entrez le nom"
                                    size="large"
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
                            {selectedClass ? 'Modifier' : 'Ajouter'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={<span style={{ color: '#ff69b4', fontSize: '20px', fontWeight: 'bold' }}>Détails de la Classe</span>}
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={null}
                destroyOnClose
                style={{ borderRadius: '12px', background: '#fff0f5', padding: '20px', boxShadow: '0 4px 12px rgba(255, 105, 180, 0.2)' }}
            >
                {classDetails && (
                    <div>
                        <Typography.Paragraph><Text strong style={{ color: '#ff69b4' }}>Nom :</Text> {classDetails.nom}</Typography.Paragraph>
                        <Typography.Paragraph><Text strong style={{ color: '#ff69b4' }}>Date de Création :</Text> {new Date(classDetails.creationDate).toLocaleDateString()}</Typography.Paragraph>
                        <Typography.Paragraph><Text strong style={{ color: '#ff69b4' }}>Créateur :</Text> {classDetails.creator}</Typography.Paragraph>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClassManagement;