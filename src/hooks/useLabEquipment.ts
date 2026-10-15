import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { subscribeLabEquipments, subscribeLabReservations } from '../services/equipmentService';
import type { Equipment, EquipmentReservation } from '../types/equipment';

/** Equipamentos do laboratório em tempo real. */
export const useLabEquipments = (labId?: string) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!labId) {
      setEquipments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeLabEquipments(
      labId,
      items => {
        setEquipments(items);
        setLoading(false);
      },
      err => {
        console.error('Erro ao assinar equipamentos:', err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [labId]);

  return { equipments, loading, error };
};

/** Reservas do laboratório em tempo real, já em ordem cronológica. */
export const useLabReservations = (labId?: string) => {
  const [reservations, setReservations] = useState<EquipmentReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!labId) {
      setReservations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeLabReservations(
      labId,
      items => {
        setReservations(items);
        setLoading(false);
      },
      err => {
        console.error('Erro ao assinar reservas:', err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [labId]);

  return { reservations, loading, error };
};

/**
 * Indica se o usuário atual pode gerir o laboratório (equipamentos e reservas de terceiros).
 * Regra: admin da plataforma ou administrador (adminId) do laboratório.
 */
export const useCanManageLab = (labId?: string) => {
  const { userProfile } = useAuth();
  const [labAdminId, setLabAdminId] = useState<string | null>(null);

  useEffect(() => {
    if (!labId) return;
    let active = true;
    getDoc(doc(db, 'labs', labId))
      .then(snap => {
        if (active) setLabAdminId(snap.exists() ? (snap.data().adminId as string) || null : null);
      })
      .catch(err => console.error('Erro ao carregar administrador do laboratório:', err));
    return () => {
      active = false;
    };
  }, [labId]);

  if (!userProfile) return false;
  return userProfile.role === 'admin' || (!!labAdminId && labAdminId === userProfile.id);
};

/** Relógio que atualiza a cada `intervalMs` (padrão: 1 min) para recalcular períodos/check-in. */
export const useNow = (intervalMs = 60_000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
};
