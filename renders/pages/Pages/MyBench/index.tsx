import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlaskConical, CalendarDays, Settings2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { useLabEquipments, useLabReservations } from '../../../../src/hooks/useLabEquipment';
import Header from './Header';
import BenchWork from './BenchWork';
import RecentNotes from './RecentNotes';
import LabImages from './LabImages';
import InventoryAlert from './InventoryAlert';
import Schedule from './Schedule';
import Communications from './Communications';
import FragLabBancada from '../../../components/FragLabBancada';
import FragLabEquipamentos from '../../../components/FragLabEquipamentos';
import InventoryModal from '../../../modals/InventoryModal';
import AgendaModal from '../../../modals/AgendaModal';
import NotesModal from '../../../modals/NotesModal';
import EquipmentReservationModal from '../../../modals/EquipmentReservationModal';
import LabMembersModal from '../../../modals/LabMembersModal';
import { useLabMembers } from '../../../../src/hooks/useLabMembers';
import './styles.css';

type WorkspaceTab = 'bancada' | 'reservas' | 'equipamentos';

const MyBench: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  // labId prioritiza o ID da rota (/lab/:id/workspace) ou o laboratório vinculado ao usuário
  const labId = id || userProfile?.lab?.id || '1';

  const { equipments } = useLabEquipments(labId);
  const { reservations, loading: reservationsLoading } = useLabReservations(labId);
  const { members, onlineMembers, onlineCount, loading: membersLoading } = useLabMembers(labId);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('bancada');
  const [isInventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [isAgendaModalOpen, setAgendaModalOpen] = useState(false);
  const [isNotesModalOpen, setNotesModalOpen] = useState(false);
  const [isReservationModalOpen, setReservationModalOpen] = useState(false);
  const [isMembersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const firstName = userProfile?.name?.trim().split(' ')[0] || 'Pesquisador';

  return (
    <div className="mybench-page">
      <div className="mybench-container">
        {/* BARRA SUPERIOR DE NAVEGAÇÃO & ABAS DO WORKSPACE */}
        <div className="mybench-top-bar">
          <button
            className="mybench-back-link"
            onClick={() => (id ? navigate(`/lab/${id}`) : navigate(-1))}
            id="mybench-back-to-lab"
          >
            <ArrowLeft size={16} /> Voltar ao Laboratório
          </button>

          <nav className="mybench-nav-tabs" aria-label="Navegação do Workspace">
            <button
              className={`mybench-tab-btn ${activeTab === 'bancada' ? 'active' : ''}`}
              onClick={() => setActiveTab('bancada')}
              id="tab-mybench-dashboard"
            >
              <FlaskConical size={16} /> Minha Bancada
            </button>
            <button
              className={`mybench-tab-btn ${activeTab === 'reservas' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservas')}
              id="tab-mybench-reservations"
            >
              <CalendarDays size={16} /> Agenda &amp; Timeline
            </button>
            <button
              className={`mybench-tab-btn ${activeTab === 'equipamentos' ? 'active' : ''}`}
              onClick={() => setActiveTab('equipamentos')}
              id="tab-mybench-equipments"
            >
              <Settings2 size={16} /> Equipamentos
            </button>
          </nav>
        </div>

        {/* CONTEÚDO CONFORME ABA ATIVA */}
        {activeTab === 'bancada' && (
          <div className="anim-fade-up">
            {/* HEADER */}
            <Header
              userName={firstName}
              labStatus="Aberto"
              onlineMembersCount={onlineCount}
              onlineMembers={onlineMembers}
              allMembers={members}
              onOpenMembersModal={() => setMembersModalOpen(true)}
            />

            {/* MAIN GRID */}
            <div className="mybench-grid">
              {/* LEFT COLUMN */}
              <div className="mybench-left-col">
                {/* TRABALHO EM BANCADA */}
                <BenchWork
                  onViewAll={() => console.log('View all experiments')}
                  onOpenNotebook={(noteId) => console.log('Open notebook', noteId)}
                  onViewProtocol={(protocolId) => console.log('View protocol', protocolId)}
                />

                {/* ANOTAÇÕES RECENTES */}
                <RecentNotes
                  onAddNote={() => {
                    setSelectedNoteId(null);
                    setNotesModalOpen(true);
                  }}
                  onOpenNote={(noteId) => {
                    setSelectedNoteId(noteId);
                    setNotesModalOpen(true);
                  }}
                />

                {/* IMAGENS DO LAB */}
                <LabImages
                  onViewAllImages={() => console.log('View all images')}
                  onViewImage={(imgId) => console.log('View image', imgId)}
                />
              </div>

              {/* RIGHT COLUMN */}
              <div className="mybench-right-col">
                {/* AVISO DE ESTOQUE */}
                <InventoryAlert
                  onRequestRestock={() => console.log('Request restock')}
                  onOpenInventory={() => setInventoryModalOpen(true)}
                />

                {/* A SUA AGENDA - CONECTADA AO FIRESTORE EM TEMPO REAL */}
                <Schedule
                  reservations={reservations}
                  loading={reservationsLoading}
                  onOpenReservationModal={() => setReservationModalOpen(true)}
                  onOpenFullSchedule={() => setActiveTab('reservas')}
                  onOpenAgenda={() => setAgendaModalOpen(true)}
                  onToggleReminder={(remId, checked) => console.log('Toggle reminder', remId, checked)}
                />

                {/* COMUNICAÇÕES */}
                <Communications />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="mybench-tab-content anim-fade-up">
            <FragLabBancada labId={labId} />
          </div>
        )}

        {activeTab === 'equipamentos' && (
          <div className="mybench-tab-content anim-fade-up">
            <FragLabEquipamentos labId={labId} />
          </div>
        )}
      </div>

      {/* MODAL DE RESERVA DE EQUIPAMENTOS */}
      <EquipmentReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        labId={labId}
        equipments={equipments}
        reservations={reservations}
      />

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
      />

      <AgendaModal
        isOpen={isAgendaModalOpen}
        onClose={() => setAgendaModalOpen(false)}
      />

      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        initialNoteId={selectedNoteId}
      />

      <LabMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        members={members}
        labName={userProfile?.lab?.name || 'Laboratório'}
        loading={membersLoading}
      />
    </div>
  );
};

export default MyBench;
