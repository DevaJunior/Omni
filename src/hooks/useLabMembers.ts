import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { labService } from '../services/labService';
import type { LabMember } from '../types/lab';

/**
 * Hook para buscar e acompanhar membros reais do laboratório em tempo real,
 * com contagem de membros totais e membros online.
 */
export const useLabMembers = (labId?: string, labAdminId?: string) => {
  const { userProfile } = useAuth();
  const [members, setMembers] = useState<LabMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!labId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = labService.subscribeLabMembers(
      labId,
      userProfile,
      (updatedMembers) => {
        setMembers(updatedMembers);
        setLoading(false);
      },
      labAdminId
    );

    return () => unsubscribe();
  }, [labId, labAdminId, userProfile?.id, userProfile?.lab?.id]);

  const onlineMembers = useMemo(() => {
    return members.filter(m => m.isOnline);
  }, [members]);

  const onlineCount = onlineMembers.length;
  const totalCount = members.length;

  return {
    members,
    totalCount,
    onlineMembers,
    onlineCount,
    loading
  };
};
