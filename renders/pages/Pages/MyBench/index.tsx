import React from 'react';
//import Navbar from '../../../menus/Navbar';
import Header from './Header';
import BenchWork from './BenchWork';
import RecentNotes from './RecentNotes';
import LabImages from './LabImages';
import InventoryAlert from './InventoryAlert';
import Schedule from './Schedule';
import Communications from './Communications';
import './styles.css';

const MyBench: React.FC = () => {
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
                onAddNote={() => console.log('Add note')}
                onOpenNote={(id) => console.log('Open note', id)}
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
              />

              {/* A SUA AGENDA */}
              <Schedule
                onToggleReminder={(id, checked) => console.log('Toggle reminder', id, checked)}
              />

              {/* COMUNICAÇÕES */}
              <Communications />

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyBench;
