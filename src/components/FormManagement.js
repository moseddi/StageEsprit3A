
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  Popconfirm,
  Button,
  Tag,
  Alert,
  DatePicker,
  Select,
  Row,
  Col,
  InputNumber,
  Spin,
  notification,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  CopyOutlined,
  QuestionOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  CopyTwoTone,
} from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import { CSVLink } from 'react-csv';
import {
  fetchFormulaires,
  createFormulaire,
  updateFormulaire,
  deleteFormulaire,
  fetchEvaluatorFormulaires,
  generateEvaluationLink,
  submitEvaluation,
  fetchQuestions,
} from '../services/apiService';
import QuestionManagement from './QuestionManagement';

const { Option } = Select;
const { Text } = Typography;

const FormManagement = ({ currentUser, theme }) => {
  const [formulaires, setFormulaires] = useState([]);
  const [filteredFormulaires, setFilteredFormulaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formulaireModalVisible, setFormulaireModalVisible] = useState(false);
  const [selectedFormulaire, setSelectedFormulaire] = useState(null);
  const [form] = Form.useForm();
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [expirationDate, setExpirationDate] = useState(null);
  const [questionManagementModalVisible, setQuestionManagementModalVisible] = useState(false);
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [questionsForSubmission, setQuestionsForSubmission] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [formDetails, setFormDetails] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Styles réutilisables
  const styles = {
    primaryColor: '#c8102e', // Rouge principal
    secondaryColor: '#991b1b', // Rouge sombre pour survol
    containerStyle: {
      padding: '20px',
      borderRadius: '12px',
      background: theme === 'light' ? '#ffffff' : '#1f1f1f',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
    modalStyle: {
      borderRadius: '12px',
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    buttonStyle: {
      background: '#c8102e',
      color: '#ffffff',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      padding: '6px 12px',
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
      transition: 'transform 0.3s ease, background 0.3s ease',
      border: 'none',
      ':hover': {
        transform: 'scale(1.1)',
        background: '#991b1b',
      },
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
    tableStyle: {
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      borderRadius: '12px',
      padding: '16px',
    },
  };

  // Hook personnalisé pour gérer les erreurs
  const handleError = useCallback((error, defaultMessage) => {
    notification.error({
      message: 'Erreur',
      description: error.message || defaultMessage,
      placement: 'topRight',
    });
  }, []);

  // Charger les formulaires
  const loadFormulaires = useCallback(
    async (page = 0, size = 10) => {
      if (!currentUser?.authToken) return;
      setLoading(true);
      try {
        let data;
        if (currentUser.role === 'ADMIN') {
          data = await fetchFormulaires(page, size, currentUser.authToken);
          setFormulaires(data?.content || data || []);
          setFilteredFormulaires(data?.content || data || []);
        } else if (currentUser.role === 'EVALUATOR') {
          data = await fetchEvaluatorFormulaires(currentUser.id, currentUser.authToken);
          setFormulaires(data || []);
          setFilteredFormulaires(data || []);
        }
      } catch (error) {
        handleError(error, 'Échec du chargement des formulaires');
        setFormulaires([]);
        setFilteredFormulaires([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUser?.authToken, currentUser?.id, currentUser?.role, handleError]
  );

  useEffect(() => {
    if (currentUser?.authToken) {
      loadFormulaires();
    }
  }, [currentUser?.authToken, loadFormulaires]);

  // Filtrer les formulaires
  const filterFormulaires = useCallback(() => {
    let filtered = formulaires;
    if (searchText) {
      filtered = filtered.filter(
        (f) =>
          f.titre.toLowerCase().includes(searchText.toLowerCase()) ||
          f.niveau.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((f) => f.statut === (statusFilter === 'active'));
    }
    setFilteredFormulaires(filtered);
  }, [formulaires, searchText, statusFilter]);

  useEffect(() => {
    filterFormulaires();
  }, [searchText, statusFilter, formulaires, filterFormulaires]);

  // Soumission du formulaire
  const handleFormulaireSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        id_createur: currentUser.id,
        statut: values.statut !== undefined ? values.statut : true,
      };
      setLoading(true);
      if (selectedFormulaire) {
        await updateFormulaire(selectedFormulaire.id, formData, currentUser.authToken);
        notification.success({
          message: 'Succès',
          description: 'Formulaire mis à jour avec succès',
          placement: 'topRight',
        });
      } else {
        await createFormulaire(formData, currentUser.authToken);
        notification.success({
          message: 'Succès',
          description: 'Formulaire créé avec succès',
          placement: 'topRight',
        });
      }
      setFormulaireModalVisible(false);
      form.resetFields();
      loadFormulaires();
    } catch (error) {
      handleError(error, 'Opération échouée');
    } finally {
      setLoading(false);
    }
  };

  // Suppression du formulaire
  const handleDeleteFormulaire = async (id) => {
    try {
      setLoading(true);
      await deleteFormulaire(id, currentUser.authToken);
      notification.success({
        message: 'Succès',
        description: 'Formulaire supprimé avec succès',
        placement: 'topRight',
      });
      loadFormulaires();
    } catch (error) {
      handleError(error, 'Échec de la suppression du formulaire');
    } finally {
      setLoading(false);
    }
  };

  // Générer le lien d'évaluation
  const handleGenerateEvaluationLink = async (formId) => {
    try {
      setLoading(true);
      const exp = expirationDate ? expirationDate.toISOString() : null;
      const data = await generateEvaluationLink(formId, currentUser.authToken, exp);
      const link = `${window.location.origin}/evaluation?token=${data.token}`;
setGeneratedLink(link);
notification.success({
    message: 'Succès',
    description: 'Lien généré ! Copiez-le ou scannez le QR code.',
    placement: 'topRight',
});
} catch (error) {
    handleError(error, 'Échec de la génération du lien');
} finally {
    setLoading(false);
}
};

// Ouvrir le modal de soumission
const handleOpenSubmissionModal = async (record) => {
    if (!currentUser?.authToken) return;
    setSelectedFormulaire(record);
    setLoading(true);
    try {
        const questions = await fetchQuestions(record.id, currentUser.authToken);
        setQuestionsForSubmission(questions || []);
        setSubmissionModalVisible(true);
    } catch (error) {
        handleError(error, 'Échec du chargement des questions pour la soumission');
    } finally {
        setLoading(false);
    }
};

// Soumettre l'évaluation
const handleSubmitEvaluation = async (values) => {
    try {
        setLoading(true);
        const answers = Object.keys(values).map((key) => ({
            questionId: parseInt(key.replace('question_', '')),
            reponseText: values[key],
        }));
        await submitEvaluation(selectedFormulaire.id, answers, currentUser.authToken);
        notification.success({
            message: 'Succès',
            description: 'Formulaire soumis avec succès',
            placement: 'topRight',
        });
        setSubmissionModalVisible(false);
    } catch (error) {
        handleError(error, 'Échec de la soumission');
    } finally {
        setLoading(false);
    }
};

// Afficher les détails
const handleShowDetails = async (record) => {
    setSelectedFormulaire(record);
    setLoading(true);
    try {
        const questions = await fetchQuestions(record.id, currentUser.authToken);
        setFormDetails({
            ...record,
            questions: questions || [],
            creationDate: record.creationDate || 'Non spécifiée',
            creator: record.id_createur ? `Utilisateur ${record.id_createur}` : 'Inconnu',
        });
        setDetailsModalVisible(true);
    } catch (error) {
        handleError(error, 'Échec du chargement des détails');
    } finally {
        setLoading(false);
    }
};

// Exporter en PDF
const handleExportPDF = async (record) => {
    setLoading(true);
    try {
        const questions = await fetchQuestions(record.id, currentUser.authToken);
        const doc = new jsPDF();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(18);
        doc.setTextColor(200, 16, 46); // #c8102e
        doc.setFont('helvetica', 'bold');
        doc.text("Formulaire d'Évaluation", 70, 20);
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 16, 46); // #c8102e
        doc.line(10, 35, 200, 35);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Détails du Formulaire', 10, 50);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Titre: ${record.titre}`, 10, 60);
        doc.text(`Niveau: ${record.niveau}`, 10, 70);
        doc.text(`Date de Création: ${new Date(record.creationDate).toLocaleDateString()}`, 10, 80);
        doc.text(`Créateur: Utilisateur ${record.id_createur || 'Inconnu'}`, 10, 90);
        doc.text(`Statut: ${record.statut ? 'Actif' : 'Inactif'}`, 10, 100);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 16, 46); // #c8102e
        doc.text('Questions', 10, 120);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        let y = 130;
        questions.forEach((q, index) => {
            doc.setFillColor(theme === 'light' ? '#ffffff' : '#2d2d2d');
            doc.rect(10, y - 5, 190, 25, 'F');
            doc.setTextColor(200, 16, 46); // #c8102e
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${q.libelle}`, 15, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Barème: ${q.bareme}, Pondération: ${q.ponderation}`, 20, y + 10);
            y += 30;
            if (y > 260) {
                doc.addPage();
                y = 20;
                doc.setFontSize(18);
                doc.setTextColor(200, 16, 46); // #c8102e
                doc.setFont('helvetica', 'bold');
                doc.text("Formulaire d'Évaluation", 70, 20);
                doc.setLineWidth(0.5);
                doc.setDrawColor(200, 16, 46); // #c8102e
                doc.line(10, 35, 200, 35);
                y = 50;
            }
        });
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Généré le ${new Date().toLocaleDateString()}`, 10, 280);
        doc.text('Esprit - Système de Gestion des Formulaires', 140, 280);
        doc.save(`Formulaire_${record.titre}.pdf`);
        notification.success({
            message: 'Succès',
            description: 'PDF exporté avec succès',
            placement: 'topRight',
        });
    } catch (error) {
        handleError(error, "Échec de l'exportation PDF");
    } finally {
        setLoading(false);
    }
};

// Exporter en CSV
const handleExportCSV = () => {
    const csvData = formulaires.map((f) => ({
        ID: f.id,
        Titre: f.titre,
        Niveau: f.niveau,
        Statut: f.statut ? 'Actif' : 'Inactif',
        'Date de Création': new Date(f.creationDate).toLocaleDateString(),
        Créateur: `Utilisateur ${f.id_createur || 'Inconnu'}`,
    }));
    return (
        <Tooltip title="Exporter en CSV">
            <CSVLink
                data={csvData}
                filename="formulaires.csv"
                style={styles.iconButtonStyle}
                aria-label="Exporter les formulaires en CSV"
            >
                <FileExcelOutlined style={{ fontSize: '20px' }} />
            </CSVLink>
        </Tooltip>
    );
};

// Dupliquer un formulaire
const handleDuplicateFormulaire = async (record) => {
    try {
        setLoading(true);
        const formData = {
            titre: `${record.titre} (Copie)`,
            niveau: record.niveau,
            description: record.description,
            statut: record.statut,
            id_createur: currentUser.id,
        };
        await createFormulaire(formData, currentUser.authToken);
        notification.success({
            message: 'Succès',
            description: 'Formulaire dupliqué avec succès',
            placement: 'topRight',
        });
        loadFormulaires();
    } catch (error) {
        handleError(error, 'Échec de la duplication du formulaire');
    } finally {
        setLoading(false);
    }
};

// Colonnes du tableau
const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        sorter: (a, b) => a.id - b.id,
    },
    {
        title: 'Titre',
        dataIndex: 'titre',
        key: 'titre',
        sorter: (a, b) => a.titre.localeCompare(b.titre),
    },
    {
        title: 'Niveau',
        dataIndex: 'niveau',
        key: 'niveau',
        sorter: (a, b) => a.niveau.localeCompare(b.niveau),
    },
    {
        title: 'Statut',
        dataIndex: 'statut',
        key: 'statut',
        render: (statut) => (
            <Tag color={statut ? '#389e0d' : '#c8102e'}>{statut ? 'Actif' : 'Inactif'}</Tag>
        ),
        width: 120,
    },
    {
        title: 'Actions',
        key: 'actions',
        width: 350,
        render: (_, record) => (
            <Space>
                {currentUser?.role === 'ADMIN' ? (
                    <>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => {
                                setSelectedFormulaire(record);
                                form.setFieldsValue(record);
                                setFormulaireModalVisible(true);
                            }}
                            style={{ color: styles.secondaryColor }}
                        />
                        <Popconfirm
                            title="Êtes-vous sûr de supprimer ce formulaire ?"
                            onConfirm={() => handleDeleteFormulaire(record.id)}
                            okText="Oui"
                            cancelText="Non"
                        >
                            <Button icon={<DeleteOutlined />} style={{ color: styles.secondaryColor }} />
                        </Popconfirm>
                        <Button
                            icon={<QuestionOutlined />}
                            onClick={() => {
                                setSelectedFormulaire(record);
                                setQuestionManagementModalVisible(true);
                            }}
                            style={{ color: styles.secondaryColor }}
                        >
                            Questions
                        </Button>
                        <Button
                            icon={<LinkOutlined />}
                            onClick={() => {
                                setSelectedFormulaire(record);
                                setLinkModalVisible(true);
                                handleGenerateEvaluationLink(record.id);
                            }}
                            style={{ color: styles.secondaryColor }}
                        />
                        <Button
                            icon={<InfoCircleOutlined />}
                            onClick={() => handleShowDetails(record)}
                            style={{ color: styles.secondaryColor }}
                        />
                        <Button
                            icon={<FilePdfOutlined />}
                            onClick={() => handleExportPDF(record)}
                            style={{ color: styles.secondaryColor }}
                        />
                        <Tooltip title="Dupliquer le formulaire">
                            <Button
                                icon={<CopyTwoTone />}
                                onClick={() => handleDuplicateFormulaire(record)}
                                style={styles.iconButtonStyle}
                                aria-label="Dupliquer le formulaire"
                            />
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <Button
                            type="primary"
                            onClick={() => handleOpenSubmissionModal(record)}
                            style={styles.buttonStyle}
                            aria-label="Remplir le formulaire"
                        >
                            Remplir
                        </Button>
                        <Button
                            icon={<InfoCircleOutlined />}
                            onClick={() => handleShowDetails(record)}
                            style={{ color: styles.secondaryColor }}
                        />
                    </>
                )}
            </Space>
        ),
    },
];

if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'EVALUATOR')) {
    return (
        <Alert
            message="Accès non autorisé"
            description="Vous n'avez pas les permissions nécessaires pour voir cette section."
            type="error"
            showIcon
            style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e' }}
        />
    );
}

return (
    <div style={styles.containerStyle}>
        <Spin spinning={loading}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
                <Col />
                <Col>{currentUser?.role === 'ADMIN' && handleExportCSV()}</Col>
            </Row>
            {currentUser?.role === 'ADMIN' && (
                <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                    <Col span={8}>
                        <Input
                            placeholder="Rechercher par titre ou niveau"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={styles.inputStyle}
                            size="large"
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ ...styles.selectStyle, width: '100%' }}
                            size="large"
                        >
                            <Option value="all">Tous les statuts</Option>
                            <Option value="active">Actif</Option>
                            <Option value="inactive">Inactif</Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Tooltip title="Ajouter un nouveau formulaire">
                            <Button
                                type="primary"
                                icon={<PlusCircleOutlined />}
                                onClick={() => {
                                    setSelectedFormulaire(null);
                                    form.resetFields();
                                    setFormulaireModalVisible(true);
                                }}
                                style={styles.buttonStyle}
                                aria-label="Ajouter un nouveau formulaire"
                            />
                        </Tooltip>
                    </Col>
                </Row>
            )}
            <Table
                columns={columns}
                dataSource={filteredFormulaires}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSizeOptions: ['10', '20', '50'],
                    showSizeChanger: true,
                    defaultPageSize: 10,
                }}
                style={styles.tableStyle}
            />
            {/* Modal de gestion des questions */}
            {currentUser?.role === 'ADMIN' && (
                <Modal
                    title={
                        <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
                {selectedFormulaire ? `Questions pour "${selectedFormulaire.titre}"` : 'Gérer les Questions'}
              </span>
                    }
                    open={questionManagementModalVisible}
                    onCancel={() => {
                        setQuestionManagementModalVisible(false);
                        setSelectedFormulaire(null);
                    }}
                    footer={null}
                    width={800}
                    destroyOnClose
                    style={styles.modalStyle}
                >
                    {selectedFormulaire ? (
                        <QuestionManagement
                            formulaireId={selectedFormulaire.id}
                            authToken={currentUser.authToken}
                            selectedFormulaire={selectedFormulaire}
                            onClose={() => {
                                setQuestionManagementModalVisible(false);
                                setSelectedFormulaire(null);
                                loadFormulaires();
                            }}
                        />
                    ) : (
                        <Alert message="Aucun formulaire sélectionné" type="warning" />
                    )}
                </Modal>
            )}
            {/* Modal de création/modification de formulaire */}
            {currentUser?.role === 'ADMIN' && (
                <Modal
                    title={
                        <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
                {selectedFormulaire ? 'Modifier Formulaire' : 'Créer Nouvel Formulaire'}
              </span>
                    }
                    open={formulaireModalVisible}
                    onCancel={() => {
                        setFormulaireModalVisible(false);
                        form.resetFields();
                    }}
                    footer={null}
                    destroyOnClose
                    style={styles.modalStyle}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFormulaireSubmit}
                        style={{ maxWidth: '600px', margin: '0 auto' }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    name="titre"
                                    label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Titre</Text>}
                                    rules={[
                                        { required: true, message: 'Veuillez entrer le titre du formulaire!' },
                                        { min: 5, message: 'Le titre doit contenir au moins 5 caractères!' },
                                    ]}
                                >
                                    <Input
                                        style={styles.inputStyle}
                                        placeholder="Entrez le titre"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="niveau"
                                    label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Niveau</Text>}
                                    rules={[{ required: true, message: 'Veuillez sélectionner le niveau du formulaire!' }]}
                                >
                                    <Select
                                        style={styles.selectStyle}
                                        size="large"
                                        placeholder="Sélectionner un niveau"
                                    >
                                        <Option value="L1">L1</Option>
                                        <Option value="L2">L2</Option>
                                        <Option value="L3">L3</Option>
                                        <Option value="Master">Master</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Description</Text>}
                                    rules={[{ max: 500, message: 'La description ne peut pas dépasser 500 caractères!' }]}
                                >
                                    <Input.TextArea
                                        style={styles.inputStyle}
                                        rows={4}
                                        placeholder="Entrez la description"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    name="statut"
                                    label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Statut (Actif/Inactif)</Text>}
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="maxSubmissions"
                                    label={<Text style={{ color: styles.primaryColor, fontWeight: '500' }}>Nombre max de soumissions</Text>}
                                >
                                    <InputNumber
                                        min={1}
                                        style={{ ...styles.inputStyle, width: '100%' }}
                                        placeholder="Optionnel"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                style={styles.buttonStyle}
                                icon={<PlusCircleOutlined />}
                                aria-label={selectedFormulaire ? 'Modifier le formulaire' : 'Créer un formulaire'}
                            >
                                {selectedFormulaire ? 'Modifier' : 'Créer'} Formulaire
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )}
            {/* Modal de génération de lien */}
            <Modal
                title={
                    <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
              Générer lien d'évaluation
            </span>
                }
                open={linkModalVisible}
                onCancel={() => {
                    setLinkModalVisible(false);
                    setGeneratedLink('');
                    setExpirationDate(null);
                }}
                footer={[
                    <Button
                        key="copy"
                        icon={<CopyOutlined />}
                        disabled={!generatedLink}
                        onClick={() => {
                            navigator.clipboard.writeText(generatedLink);
                            notification.success({
                                message: 'Succès',
                                description: 'Lien copié dans le presse-papier',
                                placement: 'topRight',
                            });
                        }}
                        style={styles.buttonStyle}
                    >
                        Copier le lien
                    </Button>,
                    <Button
                        key="close"
                        onClick={() => {
                            setLinkModalVisible(false);
                            setGeneratedLink('');
                            setExpirationDate(null);
                        }}
                        style={{ borderRadius: '8px', background: '#c8102e', borderColor: '#c8102e', color: '#ffffff' }}
                    >
                        Fermer
                    </Button>,
                ]}
                destroyOnClose
                style={styles.modalStyle}
            >
                <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                    <Col span={24}>
                        <DatePicker
                            showTime
                            size="large"
                            style={styles.inputStyle}
                            placeholder="Choisissez la date d'expiration (optionnel)"
                            onChange={(date) => setExpirationDate(date)}
                            value={expirationDate}
                            allowClear
                        />
                    </Col>
                </Row>
                {generatedLink ? (
                    <>
                        <Alert
                            message="Lien généré"
                            description={<a href={generatedLink} target="_blank" rel="noopener noreferrer">{generatedLink}</a>}
                            type="success"
                            showIcon
                            style={{ marginBottom: '20px', background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e' }}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <Text strong style={{ color: styles.primaryColor }}>
                                QR Code pour le lien d'évaluation
                            </Text>
                            <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
                                <QRCodeCanvas value={generatedLink} size={200} />
                            </div>
                        </div>
                    </>
                ) : (
                    <Alert
                        message="Le lien sera généré automatiquement avec la date d'expiration sélectionnée."
                        type="info"
                        showIcon
                        style={{ background: theme === 'light' ? '#ffffff' : '#2d2d2d', borderColor: '#c8102e' }}
                    />
                )}
            </Modal>
            {/* Modal de soumission */}
            <Modal
                title={
                    <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
              {selectedFormulaire ? `Remplir "${selectedFormulaire.titre}"` : 'Remplir Formulaire'}
            </span>
                }
                open={submissionModalVisible}
                onCancel={() => setSubmissionModalVisible(false)}
                footer={null}
                destroyOnClose
                width={700}
                style={styles.modalStyle}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmitEvaluation}
                    style={{ maxHeight: '70vh', overflowY: 'auto' }}
                >
                    {questionsForSubmission.map((q) => (
                        <Form.Item
                            key={q.id}
                            name={`question_${q.id}`}
                            label={<Text strong style={{ color: styles.primaryColor }}>{q.libelle}</Text>}
                            rules={[{ required: true, message: 'Veuillez répondre à cette question.' }]}
                        >
                            <Input.TextArea
                                rows={2}
                                placeholder="Votre réponse ici..."
                                style={styles.inputStyle}
                            />
                        </Form.Item>
                    ))}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            style={styles.buttonStyle}
                            aria-label="Soumettre l'évaluation"
                        >
                            Soumettre
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            {/* Modal de détails */}
            <Modal
                title={
                    <span style={{ color: styles.primaryColor, fontSize: '20px', fontWeight: 'bold' }}>
              {formDetails ? `Détails du formulaire "${formDetails.titre}"` : 'Détails du formulaire'}
            </span>
                }
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setDetailsModalVisible(false)}
                        style={{ borderRadius: '8px', background: '#c8102e', borderColor: '#c8102e', color: '#ffffff' }}
                    >
                        Fermer
                    </Button>,
                ]}
                width={800}
                destroyOnClose
                style={styles.modalStyle}
            >
                {formDetails ? (
                    <div>
                        <Typography.Paragraph>
                            <Text strong style={{ color: styles.primaryColor }}>Titre :</Text> {formDetails.titre}
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            <Text strong style={{ color: styles.primaryColor }}>Niveau :</Text> {formDetails.niveau}
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            <Text strong style={{ color: styles.primaryColor }}>Description :</Text> {formDetails.description}
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            <Text strong style={{ color: styles.primaryColor }}>Date de création :</Text>{' '}
                            {new Date(formDetails.creationDate).toLocaleString()}
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            <Text strong style={{ color: styles.primaryColor }}>Créateur :</Text> {formDetails.creator}
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                            <Text strong style={{ color: styles.primaryColor }}>Statut :</Text>{' '}
                            {formDetails.statut ? 'Actif' : 'Inactif'}
                        </Typography.Paragraph>
                        <Typography.Title level={4} style={{ color: styles.primaryColor }}>
                            Questions
                        </Typography.Title>
                        <ul>
                            {formDetails.questions.map((q) => (
                                <li key={q.id}>
                                    {q.libelle} (Barème: {q.bareme}, Pondération: {q.ponderation})
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <Alert message="Aucun détail disponible" type="info" />
                )}
            </Modal>
        </Spin>
    </div>
);
};

export default FormManagement;
