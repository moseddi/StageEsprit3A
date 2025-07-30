
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Typography, Select, Spin, notification, Tooltip } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { updateCurrentUser, checkEmailExists } from '../services/apiService';

const { Text } = Typography;
const { Option } = Select;

const UserProfile = ({ currentUser, onUserUpdate, theme }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const didInitialize = useRef(false);

  // Styles réutilisables
  const styles = {
    primaryColor: '#c8102e', // Rouge principal
    secondaryColor: '#991b1b', // Rouge sombre pour survols et labels
    cardStyle: {
      borderRadius: '12px',
      background: theme === 'light' ? '#ffffff' : '#1f1f1f',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
    inputStyle: {
      borderRadius: '8px',
      borderColor: '#c8102e',
      transition: 'all 0.3s ease',
    },
    selectStyle: {
      borderRadius: '8px',
      borderColor: '#c8102e',
      transition: 'all 0.3s ease',
    },
    buttonStyle: {
      background: '#c8102e',
      color: '#ffffff',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      padding: '8px 20px',
      fontSize: '16px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonStyle: {
      background: '#c8102e',
      color: '#ffffff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.3s ease',
      border: 'none',
      ':hover': {
        background: '#991b1b',
      },
    },
  };

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
          notification.error({
            message: 'Erreur',
            description: 'Les nouveaux mots de passe ne correspondent pas !',
            placement: 'topRight',
          });
          setLoading(false);
          return;
        }
        userDataToUpdate.password = values.motDePasse;
      }
      const updatedUser = await updateCurrentUser(userDataToUpdate, currentUser.authToken);
      notification.success({
        message: 'Succès',
        description: 'Profil mis à jour avec succès !',
        placement: 'topRight',
      });
      onUserUpdate(updatedUser);
      form.setFieldsValue({ motDePasse: '', confirmMotDePasse: '' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      let errorMessage = 'Échec de la mise à jour du profil.';
      if (error.response && error.response.status === 409) {
        errorMessage = 'Cet email est déjà utilisé par un autre compte.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      notification.error({
        message: 'Erreur',
        description: errorMessage,
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Card style={styles.cardStyle}>
        <Spin spinning={true}>Chargement du profil...</Spin>
      </Card>
    );
  }

  return (
    <Card style={styles.cardStyle}>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={{
            nom: currentUser.nom,
            email: currentUser.email,
            role: currentUser.role,
          }}
          style={{ maxWidth: '500px', margin: '0 auto' }}
        >
          <Form.Item
            name="nom"
            label={<Text style={{ color: styles.secondaryColor, fontWeight: '500' }}>Nom Complet</Text>}
            rules={[
              { required: true, message: 'Veuillez entrer votre nom!' },
              { min: 3, message: 'Le nom doit contenir au moins 3 caractères!' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: styles.primaryColor }} />}
              size="large"
              style={styles.inputStyle}
              aria-label="Nom complet"
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={<Text style={{ color: styles.secondaryColor, fontWeight: '500' }}>Adresse Email</Text>}
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
                    return Promise.reject(new Error("Erreur lors de la vérification de l'email."));
                  }
                },
              },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: styles.primaryColor }} />}
              size="large"
              style={styles.inputStyle}
              aria-label="Adresse email"
            />
          </Form.Item>
          <Form.Item
            name="role"
            label={<Text style={{ color: styles.secondaryColor, fontWeight: '500' }}>Rôle</Text>}
            rules={[{ required: true, message: 'Veuillez sélectionner un rôle !' }]}
          >
            <Select
              size="large"
              suffixIcon={<TeamOutlined style={{ color: styles.primaryColor }} />}
              style={styles.selectStyle}
              aria-label="Rôle"
            >
              <Option value="ADMIN">Administrateur</Option>
              <Option value="EVALUATOR">Évaluateur</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="motDePasse"
            label={<Text style={{ color: styles.secondaryColor, fontWeight: '500' }}>Nouveau Mot de Passe (laisser vide pour ne pas changer)</Text>}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                  return passwordRegex.test(value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial !'
                        )
                      );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: styles.primaryColor }} />}
              size="large"
              style={styles.inputStyle}
              autoComplete="new-password"
              aria-label="Nouveau mot de passe"
            />
          </Form.Item>
          <Form.Item
            name="confirmMotDePasse"
            label={<Text style={{ color: styles.secondaryColor, fontWeight: '500' }}>Confirmer Nouveau Mot de Passe</Text>}
            dependencies={['motDePasse']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const newPassword = getFieldValue('motDePasse');
                  if (!newPassword) return Promise.resolve();
                  return newPassword === value
                    ? Promise.resolve()
                    : Promise.reject(new Error('Les mots de passe ne correspondent pas !'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: styles.primaryColor }} />}
              size="large"
              style={styles.inputStyle}
              autoComplete="new-password"
              aria-label="Confirmer nouveau mot de passe"
            />
          </Form.Item>
          <Form.Item>
            <Tooltip title="Mettre à jour le profil">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={styles.buttonStyle}
                icon={<UserSwitchOutlined />}
                aria-label="Mettre à jour le profil"
              >
                Mettre à jour
              </Button>
            </Tooltip>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default UserProfile;
