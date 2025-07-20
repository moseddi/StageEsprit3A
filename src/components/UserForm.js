import React from 'react';
import { Modal, Form, Input, Select, message, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { createUser, updateUser } from '../services/userService';
import './App.css';

const { Option } = Select;

const UserForm = ({ visible, onCancel, onSuccess, user }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (user) {
            form.setFieldsValue(user);
        } else {
            form.resetFields();
        }
    }, [user, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (user) {
                await updateUser(user.id, values);
                message.success('User updated successfully');
            } else {
                await createUser(values);
                message.success('User created successfully');
            }
            onSuccess();
        } catch (error) {
            message.error(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <Modal
            title={<span><UserSwitchOutlined className="text-pink-500 mr-2" /> {user ? 'Edit User' : 'Create User'}</span>}
            open={visible}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="nom"
                    label="Name"
                    rules={[{ required: true, message: 'Please input the name!' }]}
                >
                    <Input prefix={<UserOutlined className="text-pink-500 icon-glow" />} size="large" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Please input the email!' },
                        { type: 'email', message: 'Please input a valid email!' },
                    ]}
                >
                    <Input prefix={<MailOutlined className="text-pink-500 icon-glow" />} size="large" />
                </Form.Item>
                {!user && (
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{ required: true, message: 'Please input the password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined className="text-pink-500 icon-glow" />} size="large" />
                    </Form.Item>
                )}
                <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true, message: 'Please select a role!' }]}
                >
                    <Select size="large" placeholder="Select a role">
                        <Option value="ADMIN">Admin</Option>
                        <Option value="EVALUATOR">Evaluator</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Space>
                        <UserSwitchOutlined className="icon-action icon-glow" onClick={() => form.submit()} />
                        <span className="text-pink-500 font-semibold cursor-pointer" onClick={() => form.submit()}>
                            {user ? 'Update User' : 'Create User'}
                        </span>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserForm;