import React, { useState } from 'react';
//import Navbar from '../../../menus/Navbar';
import Header from './Header';
import BenchWork from './BenchWork';
import RecentNotes from './RecentNotes';
import LabImages from './LabImages';
import InventoryAlert from './InventoryAlert';
import Schedule from './Schedule';
import Communications from './Communications';
import './styles.css';
import InventoryModal from '../../../modals/InventoryModal';
import AgendaModal from '../../../modals/AgendaModal';
import NotesModal from '../../../modals/NotesModal';

const MyBench: React.FC = () => {
  const [isInventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [isAgendaModalOpen, setAgendaModalOpen] = useState(false);
  const [isNotesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  return (
    <>
      {/* <Navbar /> */}
      <div className="mybench-page">
        <div className="mybench-container">

          {/* HEADER */}
          <Header userName="Devair" labStatus="Aberto" onlineMembersCount={4} />

          {/* MAIN GRID */}
          <div className="mybench-grid">

            {/* LEFT COLUMN */}
            <div className="mybench-left-col">

              {/* TRABALHO EM BANCADA */}
              <BenchWork
                onViewAll={() => console.log('View all experiments')}
                onOpenNotebook={(id) => console.log('Open notebook', id)}
                onViewProtocol={(id) => console.log('View protocol', id)}
              />

              {/* ANOTAÇÕES RECENTES */}
              <RecentNotes
                onAddNote={() => {
                  setSelectedNoteId(null);
                  setNotesModalOpen(true);
                }}
                onOpenNote={(id) => {
                  setSelectedNoteId(id);
                  setNotesModalOpen(true);
                }}
              />

              {/* IMAGENS DO LAB */}
              <LabImages
                onViewAllImages={() => console.log('View all images')}
                onViewImage={(id) => console.log('View image', id)}
              />

            </div>

            {/* RIGHT COLUMN */}
            <div className="mybench-right-col">

              {/* AVISO DE ESTOQUE */}
              <InventoryAlert
                onRequestRestock={() => console.log('Request restock')}
                onOpenInventory={() => setInventoryModalOpen(true)}
              />

              {/* A SUA AGENDA */}
              <Schedule
                onToggleReminder={(id, checked) => console.log('Toggle reminder', id, checked)}
                onOpenAgenda={() => setAgendaModalOpen(true)}
              />

              {/* COMUNICAÇÕES */}
              <Communications />

            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default MyBench;
