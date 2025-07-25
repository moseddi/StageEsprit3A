// src/components/UserProfile.js
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, message, Card, Typography, Select } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { updateCurrentUser, checkEmailExists } from '../services/apiService';

const { Title } = Typography;
const { Text } = Typography;
const { Option } = Select;

const UserProfile = ({ currentUser, onUserUpdate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const didInitialize = useRef(false);

    useEffect(() => {
        if (currentUser && !didInitialize.current) {
            form.setFieldsValue({
                nom: currentUser.nom,
                email: currentUser.email,
                motDePasse: '',
                confirmMotDePasse: '',
                role: currentUser.role,
            });
            didInitialize.current = true;
        }
    }, [currentUser, form]);

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            const userDataToUpdate = {
                nom: values.nom,
                email: values.email,
                role: values.role,
            };
            if (values.motDePasse) {
                if (values.motDePasse !== values.confirmMotDePasse) {
                    message.error('Les nouveaux mots de passe ne correspondent pas !');
                    setLoading(false);
                    return;
                }
                userDataToUpdate.password = values.motDePasse;
            }
            const updatedUser = await updateCurrentUser(userDataToUpdate, currentUser.authToken);
            message.success('Profil mis à jour avec succès !');
            onUserUpdate(updatedUser);
            form.setFieldsValue({ motDePasse: '', confirmMotDePasse: '' });
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            let errorMessage = 'Échec de la mise à jour du profil.';
            if (error.response && error.response.status === 409) {
                errorMessage = 'Cet email est déjà utilisé par un autre compte.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return <Card>Chargement du profil...</Card>;
    }

    return (
        <Card
            className="profile-card"
            style={{ borderRadius: '12px', background: '#fff0f5', padding: '20px', boxShadow: '0 4px 12px rgba(255, 105, 180, 0.2)' }}
        >
            <Title level={4} className="text-center mb-6" style={{ color: '#ff69b4' }}>
                <UserOutlined className="mr-2" /> Mon Profil
            </Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                initialValues={{ nom: currentUser.nom, email: currentUser.email, role: currentUser.role }}
            >
                <Form.Item
                    name="nom"
                    label={<Text style={{ color: '#c8102e' }}>Nom Complet</Text>}
                    rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
                >
                    <Input
                        prefix={<UserOutlined className="text-red-500" />}
                        size="large"
                        className="rounded-lg"
                        style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                    />
                </Form.Item>
                <Form.Item
                    name="email"
                    label={<Text style={{ color: '#c8102e' }}>Adresse Email</Text>}
                    rules={[
                        { required: true, message: 'Veuillez entrer votre email!' },
                        { type: 'email', message: 'Email invalide!' },
                        {
                            validator: async (_, value) => {
                                if (!value || (currentUser && currentUser.email === value)) {
                                    return Promise.resolve();
                                }
                                try {
                                    const exists = await checkEmailExists(value);
                                    if (exists) {
                                        return Promise.reject(new Error('Cet email est déjà utilisé !'));
                                    }
                                    return Promise.resolve();
                                } catch (error) {
                                    console.error("Erreur lors de la vérification de l'email:", error);
                                    return Promise.reject(new Error('Erreur lors de la vérification de l\'email.'));
                                }
                            },
                        },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="text-red-500" />}
                        size="large"
                        className="rounded-lg"
                        style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                    />
                </Form.Item>
                <Form.Item
                    name="role"
                    label={<Text style={{ color: '#c8102e' }}>Rôle</Text>}
                    rules={[{ required: true, message: 'Veuillez sélectionner un rôle !' }]}
                >
                    <Select
                        size="large"
                        className="rounded-lg"
                        suffixIcon={<TeamOutlined className="text-red-500" />}
                        style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                    >
                        <Option value="ADMIN">Administrateur</Option>
                        <Option value="UTILISATEUR">Evaluateur</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="motDePasse"
                    label={<Text style={{ color: '#c8102e' }}>Nouveau Mot de Passe (laisser vide pour ne pas changer)</Text>}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value) return Promise.resolve();
                                return value.length >= 6 ? Promise.resolve() : Promise.reject(new Error('Le mot de passe doit contenir au moins 6 caractères !'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-red-500" />}
                        size="large"
                        className="rounded-lg"
                        autoComplete="new-password"
                        style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                    />
                </Form.Item>
                <Form.Item
                    name="confirmMotDePasse"
                    label={<Text style={{ color: '#c8102e' }}>Confirmer Nouveau Mot de Passe</Text>}
                    dependencies={['motDePasse']}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const newPassword = getFieldValue('motDePasse');
                                if (!newPassword) return Promise.resolve();
                                return newPassword === value ? Promise.resolve() : Promise.reject(new Error('Les mots de passe ne correspondent pas !'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-red-500" />}
                        size="large"
                        className="rounded-lg"
                        autoComplete="new-password"
                        style={{ borderRadius: '8px', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg mt-4 transition-all duration-300"
                        style={{ background: '#ff69b4', borderColor: '#ff69b4', transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => { e.target.style.background = '#c8102e'; e.target.style.borderColor = '#c8102e'; }}
                        onMouseLeave={(e) => { e.target.style.background = '#ff69b4'; e.target.style.borderColor = '#ff69b4'; }}
                    >
                        Mettre à jour le profil
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default UserProfile;