// src/components/Login.js
import React, { useState } from 'react';
import { Form, Input, Button, message, Modal, Alert } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons'; // Removed UserSwitchOutlined as it's not used here
import { loginUser, requestForgotPassword, resetPassword as resetPasswordApi } from '../services/apiService';

const Login = ({ onLoginSuccess, onShowRegister }) => { // Removed onShowForgotPassword as logic is within this component now
    const [form] = Form.useForm();
    const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
    const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [resetForm] = Form.useForm();

    const handleLogin = async (values) => {
        try {
            const trimmedPassword = values.motDePasse ? values.motDePasse.trim() : '';

            // Cette vérification est essentielle si la validation Ant Design est contournée
            if (!trimmedPassword) {
                message.error('Le mot de passe ne peut pas être vide.');
                return; // Arrêter si le mot de passe est vide après trim
            }

            const user = await loginUser({ email: values.email, motDePasse: trimmedPassword });
            // L'authToken doit aussi utiliser le mot de passe trimé
            const authToken = btoa(`${user.email}:${trimmedPassword}`);
            onLoginSuccess({ ...user, authToken });
        } catch (error) {
            message.error(error.message || 'Échec de la connexion');
        }
    };
    const handleForgotPassword = async () => {
        try {
            if (!forgotPasswordEmail) {
                message.warning('Veuillez entrer votre email en premier');
                return;
            }
            await requestForgotPassword(forgotPasswordEmail);
            message.success('Instructions de réinitialisation envoyées à votre email');
            setForgotPasswordModalVisible(false);
        } catch (error) {
            message.error(error.message || 'Échec de la demande de réinitialisation');
        }
    };

    const handleResetPassword = async (values) => {
        try {
            const { newPassword, confirmPassword } = values;
            if (newPassword !== confirmPassword) {
                message.error('Les mots de passe ne correspondent pas');
                return;
            }
            await resetPasswordApi({ email: resetEmail, token: resetToken, newPassword });
            message.success('Mot de passe réinitialisé avec succès');
            setResetPasswordModalVisible(false);
            resetForm.resetFields();
        } catch (error) {
            message.error(error.message || 'Échec de la réinitialisation du mot de passe');
        }
    };

    // Gestion de l'URL pour la réinitialisation (peut être fait dans le composant parent ou ici)
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        if (token && email) {
            setResetToken(token);
            setResetEmail(email);
            setResetPasswordModalVisible(true);
        }
    }, []);

    return (
        <>
            <Form
                form={form}
                name="login"
                onFinish={handleLogin}
                layout="vertical"
                initialValues={{ remember: true }}
                requiredMark={false}
                className="fade-in"
            >
                <Form.Item
                    name="email"
                    label={<span className="text-gray-700 font-medium">Adresse Email</span>}
                    rules={[{ required: true, message: 'Veuillez entrer votre email!' }, { type: 'email', message: 'Veuillez entrer un email valide!' }]}
                >
                    <Input
                        prefix={<MailOutlined className="text-red-500" />}
                        placeholder="exemple@esprit.tn"
                        size="large"
                        className="rounded-lg transition-all duration-300"
                    />
                </Form.Item>
                <Form.Item
                    name="motDePasse"
                    label={<span className="text-gray-700 font-medium">Mot de Passe</span>}
                    rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-red-500" />}
                        placeholder="••••••••"
                        size="large"
                        className="rounded-lg transition-all duration-300"
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg mt-4 transition-all duration-300"
                        icon={<LockOutlined />}
                    >
                        Se Connecter
                    </Button>
                    <div className="text-right mt-2">
                        <a
                            onClick={() => setForgotPasswordModalVisible(true)}
                            className="text-red-500 hover:text-red-600 text-sm transition-colors duration-300"
                        >
                            Mot de passe oublié ?
                        </a>
                    </div>
                </Form.Item>
            </Form>

            <Modal
                title={<span><MailOutlined className="text-red-500 mr-2" /> Réinitialiser le mot de passe</span>}
                open={forgotPasswordModalVisible}
                onCancel={() => setForgotPasswordModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleForgotPassword}>
                    <Form.Item
                        label="Adresse email"
                        name="email"
                        rules={[{ required: true, message: 'Veuillez entrer votre email!' }, { type: 'email', message: 'Veuillez entrer un email valide' }]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-red-500" />}
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            placeholder="Entrez votre email enregistré"
                            size="large"
                            className="rounded-lg transition-all duration-300"
                        />
                    </Form.Item>
                    <Alert
                        message="Vous recevrez un email avec des instructions pour réinitialiser votre mot de passe."
                        type="info"
                        showIcon
                        className="mb-4 rounded-lg"
                    />
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg transition-all duration-300"
                            icon={<MailOutlined />}
                        >
                            Envoyer le lien de réinitialisation
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><LockOutlined className="text-red-500 mr-2" /> Réinitialiser le mot de passe</span>}
                open={resetPasswordModalVisible}
                onCancel={() => setResetPasswordModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={resetForm} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item
                        label="Nouveau mot de passe"
                        name="newPassword"
                        rules={[{ required: true, message: 'Veuillez entrer un nouveau mot de passe!' }, { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-red-500" />}
                            placeholder="Nouveau mot de passe"
                            size="large"
                            className="rounded-lg transition-all duration-300"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Confirmer le nouveau mot de passe"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Veuillez confirmer votre nouveau mot de passe!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                                    return Promise.reject(new Error('Les mots de passe ne correspondent pas!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-red-500" />}
                            placeholder="Confirmer le nouveau mot de passe"
                            size="large"
                            className="rounded-lg transition-all duration-300"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg transition-all duration-300"
                            icon={<LockOutlined />}
                        >
                            Réinitialiser le mot de passe
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Login;