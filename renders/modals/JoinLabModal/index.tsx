import React, { useState, useEffect, useRef } from 'react';
import { X, Building2, UploadCloud, ChevronRight, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../src/config/firebaseConfig';
import { useAuth } from '../../../src/contexts/AuthContext';
import './styles.css';

interface JoinLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  labName: string;
  onSuccess?: () => void; 
}

const MOCK_COURSES = [
  "Biotecnologia",
  "Biologia",
  "Ciência da Computação",
  "Química",
  "Farmácia",
  "Medicina",
];

const JoinLabModal: React.FC<JoinLabModalProps> = ({ isOpen, onClose, labId, labName, onSuccess }) => {
  const { userProfile } = useAuth();
  const [currentUser, setCurrentUser] = useState({ name: "Carregando..." });

  useEffect(() => {
    if (isOpen && userProfile) {
      setCurrentUser({ name: userProfile.name });
    }
  }, [isOpen, userProfile]);

  const [coverLetter, setCoverLetter] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [ra, setRa] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [fileAttached, setFileAttached] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCourseInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseSearch(value);
    setSelectedCourse(""); 

    if (value.trim() === "") {
      setFilteredCourses([]);
      setShowDropdown(false);
    } else {
      const filtered = MOCK_COURSES.filter(c =>
        c.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCourses(filtered);
      setShowDropdown(filtered.length > 0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleSelectCourse = (course: string) => {
    setCourseSearch(course);
    setSelectedCourse(course);
    setShowDropdown(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileAttached(true);
    }
  };

  // Trava de limite para o RA (Máximo 20 caracteres numéricos)
  const handleRaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setRa(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !ra || !fileAttached || !userProfile) return; 

    setIsSubmitting(true);
    
    try {
      // Salva a solicitação na coleção 'lab_requests' do Firebase
      await addDoc(collection(db, 'lab_requests'), {
        labId,
        labName,
        userId: userProfile.id,
        userName: userProfile.name,
        course: selectedCourse,
        ra: ra,
        coverLetter: coverLetter,
        status: 'pending', // Status inicial. Quando aceito, muda para 'accepted'
        createdAt: serverTimestamp()
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess(); 
        
        setCoverLetter("");
        setCourseSearch("");
        setSelectedCourse("");
        setRa("");
        setFileAttached(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert("Houve um erro ao enviar sua solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="jl-modal-overlay">
      <div className="jl-modal-content">

        {/* Puxador Visual para o Mobile (Bottom Sheet) */}
        <div className="jl-bottom-sheet-handle"></div>

        <button className="jl-btn-close" onClick={onClose}>
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="jl-success-state">
            <CheckCircle2 size={48} className="jl-success-icon" />
            <h2>Solicitação Enviada!</h2>
            <p>Sua filiação ao laboratório <strong>{labName}</strong> foi enviada para análise dos administradores.</p>
          </div>
        ) : (
          <>
            <div className="jl-header">
              <div className="jl-icon-box">
                <Building2 size={24} />
              </div>
              <h2>Filiar-se ao Laboratório</h2>
              <p>Envie sua solicitação para fazer parte da equipe do laboratório <strong>{labName}</strong>.</p>
            </div>

            <form className="jl-form" onSubmit={handleSubmit}>

              <div className="jl-form-group">
                <label>NOME DO CANDIDATO</label>
                <input type="text" value={currentUser.name} disabled className="jl-input-disabled" />
              </div>

              <div className="jl-form-row">
                <div className="jl-form-group" ref={dropdownRef} style={{ position: 'relative' }}>
                  <label>CURSO <span className="jl-required">*</span></label>
                  <input
                    type="text"
                    placeholder="Ex: Biotecnologia"
                    value={courseSearch}
                    onChange={handleCourseInput}
                    required
                  />
                  {showDropdown && (
                    <ul className="jl-course-dropdown">
                      {filteredCourses.map(course => (
                        <li key={course} onClick={() => handleSelectCourse(course)}>
                          {course}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="jl-form-group">
                  <label>REGISTRO ACADÊMICO <span className="jl-required">*</span></label>
                  <input
                    type="number"
                    placeholder="Ex: 202100123"
                    value={ra}
                    onChange={handleRaChange}
                    required
                  />
                </div>
              </div>

              <div className="jl-form-group">
                <div className="jl-label-row">
                  <label>CARTA DE APRESENTAÇÃO <span className="jl-optional">(Opcional)</span></label>
                  <span className="jl-char-counter">{coverLetter.length}/250</span>
                </div>
                <textarea
                  placeholder="Conte um pouco sobre suas motivações..."
                  rows={3}
                  maxLength={250}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="jl-textarea-vertical"
                />
              </div>

              <div className="jl-form-group">
                <label>CURRÍCULO (PDF) <span className="jl-required">*</span></label>
                <label className={`jl-file-upload ${fileAttached ? 'attached' : ''}`}>
                  <input type="file" accept=".pdf" onChange={handleFileChange} required />
                  <UploadCloud size={24} className="jl-upload-icon" />
                  <span>{fileAttached ? "Currículo Anexado" : "Clique para anexar arquivo"}</span>
                </label>
              </div>

              <button
                type="submit"
                className="jl-btn-submit"
                disabled={!selectedCourse || !ra || !fileAttached || isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Solicitação"} <ChevronRight size={18} />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default JoinLabModal;