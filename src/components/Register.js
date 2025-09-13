import React from 'react';
import { Form, Input, Button, message, Select, Alert, Card, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { createUser, checkEmailExists } from '../services/apiService';

const { Option } = Select;
const { Title, Text } = Typography;

const styles = {
    primaryColor: '#c8102e',
    cardStyle: {
        width: '100%',
        maxWidth: '400px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.95)', // Rendu plus opaque
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        border: '1px solid #e8e8e8',
        backdropFilter: 'blur(10px)',
    },
    // Le style 'containerStyle' a été simplifié
    containerStyle: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    inputStyle: {
        borderRadius: '8px',
        borderColor: '#d9d9d9',
        background: '#ffffff',
        color: '#000000',
        fontSize: '16px',
        padding: '12px',
        transition: 'all 0.3s ease',
    },
    buttonStyle: {
        background: '#c8102e',
        color: '#ffffff',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        border: 'none',
        width: '100%',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
    },
    linkStyle: {
        color: '#c8102e',
        fontSize: '14px',
        transition: 'color 0.3s ease',
    },
    alertStyle: {
        background: '#fafafa',
        borderColor: '#d9d9d9',
        borderRadius: '8px',
        color: '#000000',
        marginBottom: '24px',
    },
    titleStyle: {
        color: '#000000',
        marginBottom: '8px',
        textAlign: 'center',
    },
    descriptionStyle: {
        color: '#666666',
        textAlign: 'center',
        marginBottom: '32px',
    },
    labelStyle: {
        color: '#000000',
        fontWeight: '500',
        fontSize: '16px',
    },
};

const Register = ({ onRegisterSuccess, onShowLogin }) => {
    // --- Correction: Les déclarations manquantes sont ajoutées ici ---
    const [form] = Form.useForm();

    const handleRegister = async (values) => {
        try {
            await createUser({
                nom: values.nom,
                email: values.email,
                password: values.motDePasse,
                role: values.role
            });
            message.success('Inscription réussie !');
            onRegisterSuccess();
        } catch (error) {
            const errorMessage = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : (error.message || 'Échec de l\'inscription');

            if (error.response && error.response.status === 409) {
                message.error('Cet email est déjà utilisé. Veuillez en choisir un autre.');
            } else {
                message.error(errorMessage);
            }
        }
    };

    return (
        <div style={styles.containerStyle}>
            <Card style={styles.cardStyle}>
                <Title level={3} style={styles.titleStyle}>Créer un compte</Title>
                <Text style={styles.descriptionStyle}>Rejoignez-nous pour gérer vos évaluations facilement.</Text>
                <Form form={form} name="register" onFinish={handleRegister} layout="vertical" requiredMark={false}>
                    <Form.Item name="nom" label={<Text style={styles.labelStyle}>Nom Complet</Text>} rules={[{ required: true, message: 'Veuillez entrer votre nom complet!' }]}>
                        <Input prefix={<UserOutlined style={{ color: styles.primaryColor }} />} placeholder="Votre Nom" size="large" style={styles.inputStyle} />
                    </Form.Item>
                    <Form.Item name="email" label={<Text style={styles.labelStyle}>Adresse Email</Text>} rules={[{ required: true, message: 'Veuillez entrer votre email!' }, { type: 'email', message: 'Veuillez entrer un email valide!' }, { validator: async (_, value) => { /* ... */ } }]}>
                        <Input prefix={<MailOutlined style={{ color: styles.primaryColor }} />} placeholder="exemple@esprit.tn" size="large" style={styles.inputStyle} />
                    </Form.Item>
                    <Form.Item name="motDePasse" label={<Text style={styles.labelStyle}>Mot de Passe</Text>} rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }, { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères!' }]}>
                        <Input.Password prefix={<LockOutlined style={{ color: styles.primaryColor }} />} placeholder="••••••••" size="large" style={styles.inputStyle} />
                    </Form.Item>
                    <Form.Item name="confirm" label={<Text style={styles.labelStyle}>Confirmer Mot de Passe</Text>} dependencies={['motDePasse']} rules={[{ required: true, message: 'Veuillez confirmer votre mot de passe!' }, ({ getFieldValue }) => ({ validator(_, value) { /* ... */ } })]}>
                        <Input.Password prefix={<LockOutlined style={{ color: styles.primaryColor }} />} placeholder="••••••••" size="large" style={styles.inputStyle} />
                    </Form.Item>
                    <Form.Item name="role" label={<Text style={styles.labelStyle}>Rôle</Text>} rules={[{ required: true, message: 'Veuillez sélectionner un rôle!' }]} initialValue="EVALUATOR">
                        <Select placeholder="Sélectionner votre rôle" size="large" style={styles.inputStyle} dropdownStyle={{ background: 'transparent' }}>
                            <Option value="EVALUATOR" style={{ color: styles.labelStyle.color, background: 'transparent' }}>Évaluateur</Option>
                            <Option value="ADMIN" style={{ color: styles.labelStyle.color, background: 'transparent' }}>Administrateur</Option>
                        </Select>
                    </Form.Item>
                    {form.getFieldValue('role') === 'ADMIN' && (
                        <Alert message="Attention !" description="L'auto-inscription en tant qu'administrateur est fortement déconseillée pour des raisons de sécurité. Les rôles administrateurs devraient idéalement être attribués par un administrateur existant." type="warning" showIcon style={{ ...styles.alertStyle, marginBottom: '24px' }} />
                    )}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" style={styles.buttonStyle} icon={<TeamOutlined />}>S'inscrire</Button>
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                            <Text style={{ color: styles.descriptionStyle.color }}>Vous avez déjà un compte ?{' '}
                                <a onClick={onShowLogin} style={styles.linkStyle}>Connectez-vous</a>
                            </Text>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Register;