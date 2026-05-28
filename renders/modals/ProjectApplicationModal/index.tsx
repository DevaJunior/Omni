import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../src/config/firebaseConfig';
import './styles.css';

interface ProjectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  labId: string;
}

const ProjectApplicationModal: React.FC<ProjectApplicationModalProps> = ({ isOpen, onClose, project, labId }) => {
  const { userProfile } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !project) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      alert("Você precisa estar logado para se candidatar.");
      return;
    }
    
    if (!resumeFile) {
      alert("Por favor, anexe o seu currículo.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload do currículo
      const uniqueName = `${Date.now()}_${resumeFile.name}`;
      const storageRef = ref(storage, `applications/${project.id}/${userProfile.id}/${uniqueName}`);
      const uploadTask = uploadBytesResumable(storageRef, resumeFile);
      
      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', null, reject, () => { resolve(); });
      });
      const resumeUrl = await getDownloadURL(uploadTask.snapshot.ref);

      // 2. Salvar candidatura no Firestore
      await addDoc(collection(db, 'project_applications'), {
        projectId: project.id,
        labId: labId,
        userId: userProfile.id,
        userName: userProfile.name,
        userEmail: userProfile.email,
        coverLetter,
        resumeUrl,
        status: 'pending',
        appliedAt: serverTimestamp()
      });

      alert("Candidatura enviada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao enviar candidatura:", error);
      alert("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="join-modal-overlay">
      <div className="join-modal-container" style={{ maxWidth: '600px' }}>
        <button className="join-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="join-modal-header">
          <h2>Candidatar-se à Vaga</h2>
          <p>Você está se candidatando para: <strong>{project.title}</strong></p>
        </div>

        <form className="join-modal-form" onSubmit={handleSubmit}>
          <div className="join-modal-form-group">
            <label>Carta de Apresentação (Por que você quer participar?)</label>
            <textarea
              placeholder="Descreva brevemente suas motivações e aderência aos requisitos do projeto..."
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="join-modal-form-group">
            <label>Currículo (Lattes, Vitae ou Portfólio)</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            
            {!resumeFile ? (
              <div 
                className="upload-drop-area" 
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed #ccc', padding: '2rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc', marginTop: '0.5rem' }}
              >
                <UploadCloud size={32} color="#a5a6f6" style={{ marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Clique para selecionar o seu currículo em formato PDF ou DOCX</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                <FileText size={24} color="#5d5fef" />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{resumeFile.name}</p>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button type="button" onClick={() => setResumeFile(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>
                  Remover
                </button>
              </div>
            )}
          </div>

          <div className="join-modal-footer">
            <button type="button" className="join-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="join-btn-confirm" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Candidatura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectApplicationModal;
