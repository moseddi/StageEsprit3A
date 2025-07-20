import React, { useState, useEffect } from 'react';
import { Table, message, Popconfirm, Space } from 'antd';
import UserForm from './UserForm';
import { getUsers, deleteUser } from '../services/userService';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './App.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            const safeUsers = response.data.map(user => ({
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role
            }));
            console.log('Received users:', safeUsers);
            setUsers(safeUsers);
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            message.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Delete error:', error);
            message.error('Failed to delete user');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'nom',
            key: 'nom',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'pink' : 'purple'}>
                    {role?.toUpperCase() || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <EditOutlined
                        className="icon-action icon-glow"
                        onClick={() => {
                            setSelectedUser(record);
                            setModalVisible(true);
                        }}
                    />
                    <Popconfirm
                        title="Are you sure to delete this user?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <DeleteOutlined className="icon-action icon-glow" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="content-container">
            <div className="mb-4">
                <PlusCircleOutlined
                    className="icon-action icon-glow"
                    onClick={() => {
                        setSelectedUser(null);
                        setModalVisible(true);
                    }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                locale={{ emptyText: 'No users found' }}
                className="ant-table"
            />
            <UserForm
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    fetchUsers();
                }}
                user={selectedUser}
            />
        </div>
    );
};

export default UserList;