
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Modal, Alert, Spin, notification } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { loginUser, requestForgotPassword, resetPassword as resetPasswordApi } from '../services/apiService';

const { Text, Title } = Typography;

const Login = ({ onLoginSuccess, onShowRegister }) => {
  const [form] = Form.useForm();
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Styles réutilisables
  const styles = {
    primaryColor: '#c8102e', // Rouge principal
    secondaryColor: '#991b1b', // Rouge sombre pour labels et survols
    containerStyle: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#1f1f1f', // Gris sombre pour le conteneur
      padding: '24px',
    },
    cardStyle: {
      width: '100%',
      maxWidth: '400px',
      borderRadius: '12px',
      background: '#2d2d2d', // Gris sombre pour la carte
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      padding: '24px',
    },
    modalStyle: {
      borderRadius: '12px',
      background: '#2d2d2d', // Gris sombre pour les modals
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
    inputStyle: {
      borderRadius: '8px',
      borderColor: '#c8102e',
      background: '#333333', // Fond légèrement plus clair pour les champs
      color: '#ffffff',
      fontSize: '16px',
      padding: '12px',
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
    },
    linkStyle: {
      color: '#c8102e',
      fontSize: '14px',
    },
    linkHoverStyle: {
      color: '#991b1b',
    },
    alertStyle: {
      background: '#333333', // Fond légèrement plus clair pour l'alert
      borderColor: '#c8102e',
      borderRadius: '8px',
      color: '#ffffff',
      marginBottom: '24px',
    },
    titleStyle: {
      color: '#ffffff',
      marginBottom: '24px',
      textAlign: 'center',
    },
  };

  // Gestion de l'URL pour la réinitialisation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) {
      setResetToken(token);
      setResetEmail(email);
      setResetPasswordModalVisible(true);
    }
  }, []);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const trimmedPassword = values.motDePasse ? values.motDePasse.trim() : '';
      if (!trimmedPassword) {
        notification.error({
          message: 'Erreur',
          description: 'Le mot de passe ne peut pas être vide.',
          placement: 'topRight',
        });
        return;
      }
      const user = await loginUser({ email: values.email, motDePasse: trimmedPassword });
      const authToken = btoa(`${user.email}:${trimmedPassword}`);
      onLoginSuccess({ ...user, authToken });
      notification.success({
        message: 'Succès',
        description: 'Connexion réussie !',
        placement: 'topRight',
      });
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: error.message || 'Échec de la connexion',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      if (!forgotPasswordEmail) {
        notification.warning({
          message: 'Attention',
          description: 'Veuillez entrer votre email en premier',
          placement: 'topRight',
        });
        return;
      }
      await requestForgotPassword(forgotPasswordEmail);
      notification.success({
        message: 'Succès',
        description: 'Instructions de réinitialisation envoyées à votre email',
        placement: 'topRight',
      });
      setForgotPasswordModalVisible(false);
      setForgotPasswordEmail('');
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: error.message || 'Échec de la demande de réinitialisation',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const { newPassword, confirmPassword } = values;
      if (newPassword !== confirmPassword) {
        notification.error({
          message: 'Erreur',
          description: 'Les mots de passe ne correspondent pas',
          placement: 'topRight',
        });
        return;
      }
      await resetPasswordApi({ email: resetEmail, token: resetToken, newPassword });
      notification.success({
        message: 'Succès',
        description: 'Mot de passe réinitialisé avec succès',
        placement: 'topRight',
      });
      setResetPasswordModalVisible(false);
      resetForm.resetFields();
    } catch (error) {
      notification.error({
        message: 'Erreur',
        description: error.message || 'Échec de la réinitialisation du mot de passe',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.containerStyle}>
      <Spin spinning={loading}>
        <Card style={styles.cardStyle}>
          <Title level={3} style={styles.titleStyle}>
            Connexion
          </Title>
          <Form
            form={form}
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            initialValues={{ remember: true }}
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<Text style={{ color: styles.secondaryColor, fontWeight: '500', fontSize: '16px' }}>Adresse Email</Text>}
              rules={[
                { required: true, message: 'Veuillez entrer votre email!' },
                { type: 'email', message: 'Veuillez entrer un email valide!' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: styles.primaryColor }} />}
                placeholder="Entrez votre email (ex. exemple@esprit.tn)"
                size="large"
                style={styles.inputStyle}
                aria-label="Adresse email"
                aria-describedby="email-error"
              />
            </Form.Item>
            <Form.Item
              name="motDePasse"
              label={<Text style={{ color: styles.secondaryColor, fontWeight: '500', fontSize: '16px' }}>Mot de Passe</Text>}
              rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: styles.primaryColor }} />}
                placeholder="Entrez votre mot de passe"
                size="large"
                style={styles.inputStyle}
                aria-label="Mot de passe"
                aria-describedby="password-error"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={styles.buttonStyle}
                aria-label="Se connecter"
              >
                Se Connecter
              </Button>
              <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <a
                  onClick={() => setForgotPasswordModalVisible(true)}
                  style={styles.linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = styles.linkHoverStyle.color)}
                  onMouseLeave={(e) => (e.target.style.color = styles.linkStyle.color)}
                >
                  Mot de passe oublié ?
                </a>
              </div>
            </Form.Item>
            {onShowRegister && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <a
                  onClick={onShowRegister}
                  style={styles.linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = styles.linkHoverStyle.color)}
                  onMouseLeave={(e) => (e.target.style.color = styles.linkStyle.color)}
                >
                  Pas de compte ? Inscrivez-vous
                </a>
              </div>
            )}
          </Form>
        </Card>
        <Modal
          title={
            <Title level={4} style={{ color: '#ffffff', margin: 0, textAlign: 'center' }}>
              Réinitialiser le mot de passe
            </Title>
          }
          open={forgotPasswordModalVisible}
          onCancel={() => {
            setForgotPasswordModalVisible(false);
            setForgotPasswordEmail('');
          }}
          footer={null}
          destroyOnClose
          style={styles.modalStyle}
        >
          <Form layout="vertical" onFinish={handleForgotPassword}>
            <Form.Item
              label={<Text style={{ color: styles.secondaryColor, fontWeight: '500', fontSize: '16px' }}>Adresse email</Text>}
              name="email"
              rules={[
                { required: true, message: 'Veuillez entrer votre email!' },
                { type: 'email', message: 'Veuillez entrer un email valide' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: styles.primaryColor }} />}
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Entrez votre email enregistré"
                size="large"
                style={styles.inputStyle}
                aria-label="Adresse email pour réinitialisation"
                aria-describedby="forgot-password-email-error"
              />
            </Form.Item>
            <Alert
              message="Vous recevrez un email avec des instructions pour réinitialiser votre mot de passe."
              type="info"
              showIcon
              style={styles.alertStyle}
            />
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={styles.buttonStyle}
                aria-label="Envoyer le lien de réinitialisation"
              >
                Envoyer le lien de réinitialisation
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={
            <Title level={4} style={{ color: '#ffffff', margin: 0, textAlign: 'center' }}>
              Réinitialiser le mot de passe
            </Title>
          }
          open={resetPasswordModalVisible}
          onCancel={() => setResetPasswordModalVisible(false)}
          footer={null}
          destroyOnClose
          style={styles.modalStyle}
        >
          <Form
            form={resetForm}
            layout="vertical"
            onFinish={handleResetPassword}
          >
            <Form.Item
              label={<Text style={{ color: styles.secondaryColor, fontWeight: '500', fontSize: '16px' }}>Nouveau mot de passe</Text>}
              name="newPassword"
              rules={[
                { required: true, message: 'Veuillez entrer un nouveau mot de passe!' },
                { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: styles.primaryColor }} />}
                placeholder="Entrez votre nouveau mot de passe"
                size="large"
                style={styles.inputStyle}
                aria-label="Nouveau mot de passe"
                aria-describedby="new-password-error"
              />
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: styles.secondaryColor, fontWeight: '500', fontSize: '16px' }}>Confirmer le nouveau mot de passe</Text>}
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
                prefix={<LockOutlined style={{ color: styles.primaryColor }} />}
                placeholder="Confirmez votre nouveau mot de passe"
                size="large"
                style={styles.inputStyle}
                aria-label="Confirmer le nouveau mot de passe"
                aria-describedby="confirm-password-error"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={styles.buttonStyle}
                aria-label="Réinitialiser le mot de passe"
              >
                Réinitialiser le mot de passe
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Login;
