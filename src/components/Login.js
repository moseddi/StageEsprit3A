
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Modal, Alert, Spin, notification } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { loginUser, requestForgotPassword, resetPassword as resetPasswordApi } from '../services/apiService';

const { Text, Title } = Typography;

const styles = {
  primaryColor: '#c8102e',
  cardStyle: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    border: '1px solid #e8e8e8',
    backdropFilter: 'blur(10px)',
  },
  containerStyle: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalStyle: {
    borderRadius: '12px',
    background: '#ffffff',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
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

const Login = ({ onLoginSuccess, onShowRegister }) => {
  const [form] = Form.useForm();
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

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
      const authToken = `Basic ${btoa(`${values.email}:${trimmedPassword}`)}`;
      console.log('DEBUG: Login - authToken:', authToken);
      localStorage.setItem('authToken', authToken); // Persist authToken
      localStorage.setItem('currentUser', JSON.stringify({ ...user, authToken }));
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
          <Title level={3} style={styles.titleStyle}>Bienvenue !</Title>
          <Text style={styles.descriptionStyle}>Connectez-vous à votre compte pour gérer les évaluations.</Text>
          <Form form={form} name="login" onFinish={handleLogin} layout="vertical" initialValues={{ remember: true }} requiredMark={false}>
            <Form.Item name="email" label={<Text style={styles.labelStyle}>Adresse Email</Text>} rules={[{ required: true, message: 'Veuillez entrer votre email!' }, { type: 'email', message: 'Veuillez entrer un email valide!' }]}>
              <Input prefix={<MailOutlined style={{ color: styles.primaryColor }} />} placeholder="Entrez votre email (ex. exemple@esprit.tn)" size="large" style={styles.inputStyle} aria-label="Adresse email" aria-describedby="email-error" />
            </Form.Item>
            <Form.Item name="motDePasse" label={<Text style={styles.labelStyle}>Mot de Passe</Text>} rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: styles.primaryColor }} />} placeholder="Entrez votre mot de passe" size="large" style={styles.inputStyle} aria-label="Mot de passe" aria-describedby="password-error" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="large" style={styles.buttonStyle} aria-label="Se connecter">Se Connecter</Button>
              <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <a onClick={() => setForgotPasswordModalVisible(true)} style={styles.linkStyle}>Mot de passe oublié ?</a>
              </div>
            </Form.Item>
            {onShowRegister && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Text style={{ color: styles.descriptionStyle.color }}>Pas de compte ?{' '}
                  <a onClick={onShowRegister} style={styles.linkStyle}>Inscrivez-vous</a>
                </Text>
              </div>
            )}
          </Form>
        </Card>
        <Modal
          title="Mot de passe oublié"
          visible={forgotPasswordModalVisible}
          onCancel={() => setForgotPasswordModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setForgotPasswordModalVisible(false)}>Annuler</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={handleForgotPassword}>Envoyer</Button>,
          ]}
          style={styles.modalStyle}
        >
          <Input
            placeholder="Entrez votre email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            style={styles.inputStyle}
          />
        </Modal>
        <Modal
          title="Réinitialiser le mot de passe"
          visible={resetPasswordModalVisible}
          onCancel={() => setResetPasswordModalVisible(false)}
          footer={null}
          style={styles.modalStyle}
        >
          <Form form={resetForm} onFinish={handleResetPassword} layout="vertical">
            <Form.Item
              name="newPassword"
              label="Nouveau mot de passe"
              rules={[{ required: true, message: 'Veuillez entrer votre nouveau mot de passe!' }]}
            >
              <Input.Password style={styles.inputStyle} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirmer le mot de passe"
              rules={[{ required: true, message: 'Veuillez confirmer votre mot de passe!' }]}
            >
              <Input.Password style={styles.inputStyle} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={styles.buttonStyle}>
                Réinitialiser
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default Login;
