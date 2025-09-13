// src/components/UserProfile.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Form, Input, Button, Card, Typography, Select, Spin, notification, Tooltip, Upload, Avatar, Row, Col, Progress } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, TeamOutlined, UserSwitchOutlined, PictureOutlined, LoadingOutlined } from '@ant-design/icons';
import { updateCurrentUser, checkEmailExists } from '../services/apiService';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length > 7) strength += 1;
  if (password.match(/[a-z]/)) strength += 1;
  if (password.match(/[A-Z]/)) strength += 1;
  if (password.match(/[0-9]/)) strength += 1;
  if (password.match(/[^A-Za-z0-9]/)) strength += 1;

  let color = 'red';
  let status = 'Faible';
  if (strength >= 4) {
    color = '#52c41a';
    status = 'Fort';
  } else if (strength >= 2) {
    color = '#faad14';
    status = 'Moyen';
  }
  return { strength: strength * 20, color, status };
};

const UserProfile = ({ currentUser, onUserUpdate, theme }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, color: 'red', status: '' });
  const [bioLength, setBioLength] = useState(0);
  const didInitialize = useRef(false);

  // Styles dynamiques basés sur le thème, optimisés avec useMemo
  const styles = useMemo(() => ({
    primaryColor: '#c8102e',
    secondaryColor: '#991b1b',
    cardStyle: {
      borderRadius: '16px',
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      padding: '30px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      color: theme === 'light' ? '#000' : '#fff',
    },
    inputStyle: {
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      background: theme === 'light' ? '#fff' : '#3d3d3d',
      borderColor: theme === 'light' ? '#d9d9d9' : '#4d4d4d',
      color: theme === 'light' ? '#000' : '#fff',
    },
    buttonStyle: {
      background: '#c8102e',
      color: '#ffffff',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      border: 'none',
      fontWeight: '600',
    },
    avatarPreview: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '15px',
      border: `4px solid ${theme === 'light' ? '#c8102e' : '#991b1b'}`,
      cursor: 'pointer',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      ':hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 0 15px rgba(200, 16, 46, 0.4)',
      },
    },
  }), [theme]);

  useEffect(() => {
    if (currentUser && !didInitialize.current) {
      form.setFieldsValue({
        nom: currentUser.nom,
        email: currentUser.email,
        motDePasse: '',
        confirmMotDePasse: '',
        role: currentUser.role,
        bio: currentUser.bio || '',
      });
      setBioLength(currentUser.bio?.length || 0);
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
        bio: values.bio || '',
      };
      const avatarFile = values.avatar && values.avatar.length > 0 ? values.avatar[0] : null;

      if (avatarFile) {
        if (avatarFile.response && avatarFile.response.url) {
          userDataToUpdate.avatar = avatarFile.response.url;
        } else if (avatarFile.url) {
          userDataToUpdate.avatar = avatarFile.url;
        } else if (avatarFile.originFileObj) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(avatarFile.originFileObj);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });
          userDataToUpdate.avatar = base64;
        }
      } else if (currentUser.avatar) {
        // If avatar field is empty but there was a previous avatar, we assume the user wants to remove it.
        // The API should handle a null/empty value for avatar as a removal instruction.
        userDataToUpdate.avatar = null;
      }

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
      form.setFieldsValue({
        motDePasse: '',
        confirmMotDePasse: '',
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      let errorMessage = 'Échec de la mise à jour du profil.';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Problème avec les informations d\'authentification.';
        } else if (error.response.status === 409) {
          errorMessage = 'Cet email est déjà utilisé par un autre compte.';
        } else if (error.response.status === 404) {
          errorMessage = 'Utilisateur non trouvé.';
        } else {
          errorMessage = error.message;
        }
      } else {
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

  const handlePasswordChange = (e) => {
    const { strength, color, status } = getPasswordStrength(e.target.value);
    setPasswordStrength({ strength, color, status });
  };

  const handleBioChange = (e) => {
    setBioLength(e.target.value.length);
  };

  const handleAvatarUpload = ({ file, onSuccess }) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      onSuccess({ url: reader.result });
    };
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      notification.error({ message: 'Vous ne pouvez uploader que des fichiers JPG/PNG !' });
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      notification.error({ message: 'L’image doit être inférieure à 2 Mo !' });
      return false;
    }
    return true;
  };

  if (!currentUser) {
    return (
        <Card style={styles.cardStyle}>
          <Spin spinning={true}>
            <Title level={4} style={{ textAlign: 'center' }}>Chargement du profil...</Title>
          </Spin>
        </Card>
    );
  }

  return (
      <Card style={styles.cardStyle}>
        <Spin spinning={loading}>
          <Title level={2} style={{ color: styles.primaryColor, textAlign: 'center' }}>
            Profil
          </Title>
          <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={{
                nom: currentUser.nom,
                email: currentUser.email,
                role: currentUser.role,
                bio: currentUser.bio || '',
              }}
              style={{ maxWidth: '500px', margin: '0 auto' }}
          >
            <Form.Item name="avatar" valuePropName="fileList" getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e && e.fileList;
            }}>
              <Upload
                  name="avatar"
                  customRequest={handleAvatarUpload}
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
              >
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <Avatar
                      size={120}
                      src={form.getFieldValue('avatar')?.length > 0 ? form.getFieldValue('avatar')[0].url || form.getFieldValue('avatar')[0].thumbUrl : currentUser.avatar}
                      icon={!form.getFieldValue('avatar')?.length && !currentUser.avatar ? <UserOutlined /> : null}
                      style={styles.avatarPreview}
                  />
                  <Text style={{ color: styles.primaryColor, display: 'block' }}>Changer d'avatar</Text>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item
                name="nom"
                label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Nom Complet</Text>}
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
                label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Adresse Email</Text>}
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
                label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Rôle</Text>}
            >
              <Select
                  size="large"
                  suffixIcon={<TeamOutlined style={{ color: styles.primaryColor }} />}
                  style={styles.inputStyle}
                  aria-label="Rôle"
                  disabled
              >
                <Option value="ADMIN">Administrateur</Option>
                <Option value="EVALUATEUR">Évaluateur</Option>
              </Select>
            </Form.Item>
            <Form.Item
                name="bio"
                label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Bio (optionnel)</Text>}
                rules={[{ max: 500, message: 'La bio ne peut pas dépasser 500 caractères !' }]}
            >
              <TextArea
                  rows={4}
                  placeholder="Décrivez-vous en quelques mots..."
                  style={styles.inputStyle}
                  aria-label="Bio"
                  onChange={handleBioChange}
                  maxLength={500}
              />
            </Form.Item>
            <Text type="secondary" style={{ float: 'right', marginTop: '-15px', marginBottom: '10px' }}>
              {bioLength}/500
            </Text>
            <Form.Item
                name="motDePasse"
                label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Nouveau Mot de Passe</Text>}
                help={
                    passwordStrength.strength > 0 && (
                        <div>
                          <Progress
                              percent={passwordStrength.strength}
                              showInfo={false}
                              strokeColor={passwordStrength.color}
                          />
                          <Text style={{ color: passwordStrength.color }}>
                            Force : {passwordStrength.status}
                          </Text>
                        </div>
                    )
                }
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
                  onChange={handlePasswordChange}
                  aria-label="Nouveau mot de passe"
                  placeholder="Laisser vide pour ne pas changer"
              />
            </Form.Item>
            <Form.Item
                name="confirmMotDePasse"
                label={<Text style={{ color: theme === 'light' ? '#000' : '#fff', fontWeight: '500' }}>Confirmer Nouveau Mot de Passe</Text>}
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
                  placeholder="Confirmer le nouveau mot de passe"
              />
            </Form.Item>
            <Form.Item>
              <Tooltip title="Mettre à jour le profil">
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    style={{ ...styles.buttonStyle, width: '100%' }}
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