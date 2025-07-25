import React from 'react';
import { Form, Input, Button, message, Select, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import { createUser, checkEmailExists } from '../services/apiService'; // Assurez-vous d'importer checkEmailExists

const { Option } = Select;

const Register = ({ onRegisterSuccess, onShowLogin }) => {
    const [form] = Form.useForm();

    const handleRegister = async (values) => {
        try {
            // Mappez 'motDePasse' à 'password' pour le backend lors de la création d'utilisateur
            await createUser({
                nom: values.nom,
                email: values.email,
                password: values.motDePasse, // Le backend attend 'password' pour la création
                role: values.role // Utilisez le rôle sélectionné par l'utilisateur
            });
            message.success('Inscription réussie !');
            onRegisterSuccess();
        } catch (error) {
            const errorMessage = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : (error.message || 'Échec de l\'inscription');

            // Gérer spécifiquement l'erreur de conflit d'email du backend (HTTP 409)
            if (error.response && error.response.status === 409) {
                message.error('Cet email est déjà utilisé. Veuillez en choisir un autre.');
            } else {
                message.error(errorMessage);
            }
        }
    };

    return (
        <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            requiredMark={false}
            className="fade-in"
        >
            <Form.Item
                name="nom"
                label={<span className="text-gray-700 font-medium">Nom Complet</span>}
                rules={[{ required: true, message: 'Veuillez entrer votre nom complet!' }]}
            >
                <Input
                    prefix={<UserOutlined className="text-red-500" />}
                    placeholder="Votre Nom"
                    size="large"
                    className="rounded-lg transition-all duration-300"
                />
            </Form.Item>
            <Form.Item
                name="email"
                label={<span className="text-gray-700 font-medium">Adresse Email</span>}
                rules={[
                    { required: true, message: 'Veuillez entrer votre email!' },
                    { type: 'email', message: 'Veuillez entrer un email valide!' },
                    // Règle de validation asynchrone pour vérifier l'existence de l'email
                    {
                        validator: async (_, value) => {
                            if (!value) {
                                return Promise.resolve(); // Géré par la règle 'required'
                            }
                            try {
                                const exists = await checkEmailExists(value);
                                if (exists) {
                                    return Promise.reject(new Error('Cet email est déjà utilisé !'));
                                }
                                return Promise.resolve();
                            } catch (error) {
                                console.error("Erreur lors de la vérification de l'email:", error);
                                // Gérer les erreurs réseau ou backend, mais ne pas bloquer l'utilisateur si la vérification échoue
                                return Promise.reject(new Error('Impossible de vérifier l\'email. Veuillez réessayer.'));
                            }
                        },
                    },
                ]}
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
                rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }, { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères!' }]}
            >
                <Input.Password
                    prefix={<LockOutlined className="text-red-500" />}
                    placeholder="••••••••"
                    size="large"
                    className="rounded-lg transition-all duration-300"
                />
            </Form.Item>
            <Form.Item
                name="confirm"
                label={<span className="text-gray-700 font-medium">Confirmer Mot de Passe</span>}
                dependencies={['motDePasse']}
                rules={[
                    { required: true, message: 'Veuillez confirmer votre mot de passe!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('motDePasse') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Les mots de passe ne correspondent pas!'));
                        },
                    }),
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined className="text-red-500" />}
                    placeholder="••••••••"
                    size="large"
                    className="rounded-lg transition-all duration-300"
                />
            </Form.Item>
            {/* Champ pour la sélection du rôle */}
            <Form.Item
                name="role"
                label={<span className="text-gray-700 font-medium">Rôle</span>}
                rules={[{ required: true, message: 'Veuillez sélectionner un rôle!' }]}
                initialValue="EVALUATOR" // Rôle par défaut
            >
                <Select
                    prefix={<TeamOutlined className="text-red-500" />}
                    placeholder="Sélectionner votre rôle"
                    size="large"
                    className="rounded-lg transition-all duration-300"
                >
                    <Option value="EVALUATOR">Évaluateur</Option>
                    <Option value="ADMIN">Administrateur</Option>

                </Select>
            </Form.Item>
            {/* Alerte de sécurité si l'option ADMIN est décommentée et sélectionnée */}
            {form.getFieldValue('role') === 'ADMIN' && (
                <Alert
                    message="Attention !"
                    description="L'auto-inscription en tant qu'administrateur est fortement déconseillée pour des raisons de sécurité. Les rôles administrateurs devraient idéalement être attribués par un administrateur existant."
                    type="warning"
                    showIcon
                    className="mb-4 rounded-lg"
                />
            )}

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg mt-4 transition-all duration-300"
                    icon={<TeamOutlined />}
                >
                    S'inscrire
                </Button>
                <div className="text-center mt-2">
                    Vous avez déjà un compte ?{' '}
                    <a onClick={onShowLogin} className="text-red-500 hover:text-red-600 text-sm transition-colors duration-300">
                        Connectez-vous
                    </a>
                </div>
            </Form.Item>
        </Form>
    );
};

export default Register;