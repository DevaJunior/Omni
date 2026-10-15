import React from 'react';
import FragLabBancada from '../../../components/FragLabBancada';

interface BancadaTabProps {
  labId: string;
}

const BancadaTab: React.FC<BancadaTabProps> = ({ labId }) => {
  return <FragLabBancada labId={labId} />;
};

export default BancadaTab;
