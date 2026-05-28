import { useToastStore } from '../../../../src/stores/toastStore';
import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Trash2
} from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../../src/config/firebaseConfig';
import { useAuth } from '../../../../src/contexts/AuthContext';
import Skeleton from '../../../components/Skeleton';
import NewEntryModal from '../../../modals/NewEntryModal';
import ConfirmModal from '../../../../renders/components/ConfirmModal';
import './styles.css';

interface CadernoTabProps {
  labId: string;
}

const CadernoTab: React.FC<CadernoTabProps> = ({ labId }) => {
  const { addToast } = useToastStore();
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (!labId || !currentUser) return;

    // Meu caderno é estritamente privado, filtramos por userId e labId
    const q = query(
      collection(db, 'lab_notebooks'),
      where('labId', '==', labId),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedEntries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEntries(fetchedEntries);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar caderno:", error);
      // Fallback sem orderBy caso o índice não exista
      if (error.message.includes('index')) {
        const fallbackQ = query(
          collection(db, 'lab_notebooks'),
          where('labId', '==', labId),
          where('userId', '==', currentUser.uid)
        );
        onSnapshot(fallbackQ, (fallbackSnap) => {
          const fallbackEntries = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          fallbackEntries.sort((a: any, b: any) => b.createdAt - a.createdAt);
          setEntries(fallbackEntries);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [labId, currentUser]);

  const handleCreateEntry = async (data: Record<string, unknown>) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'lab_notebooks'), {
        ...data,
        labId,
        userId: currentUser.uid,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error("Erro ao criar entrada no caderno:", e);
      addToast('Ocorreu um erro ao salvar sua anotação.', 'error');
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Apagar anotação',
      message: 'Tem certeza que deseja apagar esta anotação permanentemente?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'lab_notebooks', entryId));
        } catch (e) {
          console.error("Erro ao deletar entrada:", e);
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const formatDate = (ts: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="caderno-tab-container anim-fade-up">
      <div className="caderno-header-simple">
        <div className="header-text">
          <h3>Meu Caderno (Lab Notebook)</h3>
          <p>Suas anotações privadas, protocolos e diários de experimentos.</p>
        </div>
        <button className="btn-nova-entrada" onClick={() => setIsModalOpen(true)}>
          + Nova Entrada
        </button>
      </div>

      <div className="caderno-grid">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1', padding: '24px 0' }}>
            <Skeleton type="card" height="150px" />
            <Skeleton type="card" height="150px" />
          </div>
        ) : entries.length === 0 ? (
          <p className="empty-msg" style={{gridColumn: '1 / -1'}}>Nenhuma anotação. Crie sua primeira entrada no caderno!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="notebook-card">
              <div className="notebook-card-header">
                <div className="date-badge">
                  <Calendar size={14} />
                  <span>{formatDate(entry.createdAt)}</span>
                </div>
                <button 
                  className="icon-btn-ghost text-red" 
                  onClick={() => handleDeleteEntry(entry.id)}
                  title="Excluir Anotação"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="notebook-card-body">
                <h4 className="notebook-title">{entry.title}</h4>
                <p className="notebook-desc">
                  {entry.content.length > 150 ? entry.content.substring(0, 150) + '...' : entry.content}
                </p>
              </div>
              <div className="notebook-card-footer">
                {entry.tags?.map((tag: string, idx: number) => (
                  <span key={idx} className="tag-badge-gray">{tag.toUpperCase()}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <NewEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEntry}
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default CadernoTab;
