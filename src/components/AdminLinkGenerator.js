import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, DatePicker, Typography, message } from 'antd';
import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { generateEvaluationLink } from '../services/apiService';

const { Text } = Typography;

const AdminLinkGenerator = ({
                                visible,
                                onCancel,
                                selectedFormulaire,
                                currentUser,
                                onLinkGenerated,
                            }) => {
    const [generatedLink, setGeneratedLink] = useState('');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleGenerateLink = async () => {
        if (!selectedFormulaire || !currentUser?.authToken) {
            message.error('Formulaire ou utilisateur non valide');
            return;
        }

        try {
            setLoading(true);
            const values = await form.validateFields();
            const expiration = values.expiration ? values.expiration.toISOString() : null;
            const data = await generateEvaluationLink(selectedFormulaire.id, currentUser.authToken, { expiration });
            console.log('API response:', data);
            const link = `${window.location.origin}/evaluation?token=${data.token}`;
            setGeneratedLink(link);
            onLinkGenerated?.(link);
            message.success('Lien généré avec succès');
        } catch (error) {
            console.error('Détails de l\'erreur:', error.message, error.stack);
            message.error(`Échec de la génération du lien: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            message.success('Lien copié dans le presse-papiers');
        }
    };

    useEffect(() => {
        if (visible && selectedFormulaire) {
            handleGenerateLink();
        }
        return () => {
            setGeneratedLink('');
            form.resetFields();
        };
    }, [visible, selectedFormulaire]);

    return (
        <Modal
            title={
                <span style={{ color: '#ff69b4', fontSize: '20px', fontWeight: 'bold' }}>
          Lien d'évaluation
        </span>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            style={{
                borderRadius: '12px',
                background: '#fff0f5',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(255, 105, 180, 0.2)',
            }}
        >
            <Input
                value={generatedLink}
                readOnly
                addonAfter={<CopyOutlined onClick={handleCopyLink} />}
                size="large"
                className="rounded-lg mb-4"
                style={{
                    borderRadius: '8px',
                    borderColor: '#ff69b4',
                    transition: 'all 0.3s ease',
                }}
            />
            <Form form={form} layout="vertical">
                <Form.Item
                    name="expiration"
                    label={<Text style={{ color: '#c8102e', fontWeight: '500' }}>Expiration (optionnel)</Text>}
                >
                    <DatePicker
                        showTime
                        size="large"
                        className="w-full rounded-lg"
                        style={{
                            borderRadius: '8px',
                            borderColor: '#ff69b4',
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        onClick={handleGenerateLink}
                        size="large"
                        loading={loading}
                        className="w-full bg-red-500 hover:bg-red-600 border-none rounded-lg"
                        icon={<LinkOutlined />}
                        style={{
                            background: '#ff69b4',
                            borderColor: '#ff69b4',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#c8102e';
                            e.target.style.borderColor = '#c8102e';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#ff69b4';
                            e.target.style.borderColor = '#ff69b4';
                        }}
                    >
                        Régénérer Lien
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdminLinkGenerator;