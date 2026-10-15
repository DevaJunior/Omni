import React from 'react';
import FragLabEquipamentos from '../../../components/FragLabEquipamentos';

interface GestaoEquipamentosTabProps {
  labId: string;
}

const GestaoEquipamentosTab: React.FC<GestaoEquipamentosTabProps> = ({ labId }) => {
  return <FragLabEquipamentos labId={labId} />;
};

export default GestaoEquipamentosTab;
